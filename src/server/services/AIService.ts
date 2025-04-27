import { ITrip } from '../models/Trip';
import { spawn } from 'child_process';
import path from 'path';

export class AIService {
  private pythonWrapperPath: string;

  constructor() {
    this.pythonWrapperPath = path.join(__dirname, '../../ai/wrapper.py');
  }

  async generateTravelPlan(tripPreferences: Partial<ITrip>): Promise<Partial<ITrip>> {
    try {
      const itinerary = await this.runPythonScript('generate_trip_plan', JSON.stringify(tripPreferences));
      
      return {
        itinerary
      };
    } catch (error) {
      console.error('Error calling Python AI service:', error);
      throw new Error('Failed to generate travel plan. Please try again later.');
    }
  }

  async generateDayItinerary(tripData: Partial<ITrip>, dayNumber: number): Promise<any> {
    try {
      const data = {
        tripData,
        dayNumber
      };
      
      const dayItinerary = await this.runPythonScript('generate_day_itinerary', JSON.stringify(data));
      
      return dayItinerary;
    } catch (error) {
      console.error(`Error generating day ${dayNumber} itinerary:`, error);
      throw new Error(`Failed to generate day ${dayNumber} itinerary. Please try again later.`);
    }
  }

  /**
   * Run Python script and return its output
   * @param command Command to run in the Python script
   * @param data JSON data to pass to the Python script
   * @returns Promise<any> Result from Python script
   */
  private async runPythonScript(command: string, data: string): Promise<any> {
    return new Promise((resolve, reject) => {
      const pythonCommand = process.platform === 'win32' ? 'py' : 'python3';
      
      const pythonProcess = spawn(pythonCommand, [this.pythonWrapperPath, command, data]);
      let result = '';
      let error = '';

      pythonProcess.stdout.on('data', (data) => {
        const chunk = data.toString();
        result += chunk;
      });

      pythonProcess.stderr.on('data', (data) => {
        const chunk = data.toString();
        console.error('Python stderr:', chunk);
        error += chunk;
      });

      pythonProcess.on('close', (code) => {
        if (code !== 0) {
          reject(new Error(`Python script exited with code ${code}: ${error}`));
        } else {
          try {
            resolve(JSON.parse(result));
          } catch (e) {
            console.error('Failed to parse Python script output:', result);
            reject(new Error('Failed to parse Python script output'));
          }
        }
      });
      
      pythonProcess.on('error', (err) => {
        console.error(`Failed to start Python process: ${err.message}`);
        reject(new Error(`Failed to start Python process: ${err.message}`));
      });
    });
  }
} 