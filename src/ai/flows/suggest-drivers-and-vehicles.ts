'use server';

/**
 * @fileOverview An AI agent that suggests the best matching drivers and vehicles for a new transport job.
 *
 * - suggestDriversAndVehicles - A function that suggests drivers and vehicles for a transport job.
 * - SuggestDriversAndVehiclesInput - The input type for the suggestDriversAndVehicles function.
 * - SuggestDriversAndVehiclesOutput - The return type for the suggestDriversAndVehicles function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestDriversAndVehiclesInputSchema = z.object({
  jobDescription: z.string().describe('A description of the transport job, including origin, destination, and any special requirements.'),
  availableDrivers: z.array(z.object({
    driverId: z.string(),
    availability: z.boolean().describe('Whether the driver is currently available.'),
    currentLocation: z.string().describe('The driver current location.'),
    pastJobs: z.array(z.string()).optional().describe('IDs of past jobs completed by this driver')
  })).describe('A list of available drivers and their details.'),
  availableVehicles: z.array(z.object({
    vehicleId: z.string(),
    status: z.string().describe('The current status of the vehicle (e.g., available, maintenance).'),
    location: z.string().describe('The vehicle current location.'),
    type: z.string().describe('The type of the vehicle (e.g. truck, van, motorcycle)'),
    capacity: z.string().describe('The capacity of the vehicle')
  })).describe('A list of available vehicles and their details.'),
  historicalJobData: z.array(z.object({
    jobId: z.string(),
    driverId: z.string(),
    vehicleId: z.string(),
    jobDescription: z.string(),
  })).optional().describe('Historical data of past transport jobs.'),
});

export type SuggestDriversAndVehiclesInput = z.infer<typeof SuggestDriversAndVehiclesInputSchema>;

const SuggestDriversAndVehiclesOutputSchema = z.object({
  driverSuggestion: z.object({
    driverId: z.string(),
    reason: z.string().describe('The reason for suggesting this driver.'),
  }).describe('The suggested driver for the job.'),
  vehicleSuggestion: z.object({
    vehicleId: z.string(),
    reason: z.string().describe('The reason for suggesting this vehicle.'),
  }).describe('The suggested vehicle for the job.'),
});

export type SuggestDriversAndVehiclesOutput = z.infer<typeof SuggestDriversAndVehiclesOutputSchema>;

export async function suggestDriversAndVehicles(input: SuggestDriversAndVehiclesInput): Promise<SuggestDriversAndVehiclesOutput> {
  return suggestDriversAndVehiclesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestDriversAndVehiclesPrompt',
  input: {schema: SuggestDriversAndVehiclesInputSchema},
  output: {schema: SuggestDriversAndVehiclesOutputSchema},
  prompt: `You are an AI assistant helping to match drivers and vehicles to transport jobs.

  Given the following job description:
  {{jobDescription}}

  And the following available drivers:
  {{#each availableDrivers}}
  - Driver ID: {{this.driverId}}, Availability: {{this.availability}}, Location: {{this.currentLocation}}
  {{/each}}

  And the following available vehicles:
  {{#each availableVehicles}}
  - Vehicle ID: {{this.vehicleId}}, Status: {{this.status}}, Location: {{this.location}}, Type: {{this.type}}, Capacity: {{this.capacity}}
  {{/each}}

  {{#if historicalJobData}}
  Consider this historical job data:
  {{#each historicalJobData}}
  - Job ID: {{this.jobId}}, Driver ID: {{this.driverId}}, Vehicle ID: {{this.vehicleId}}, Description: {{this.jobDescription}}
  {{/each}}
  {{/if}}

  Suggest the best driver and vehicle for this job, providing a clear reason for each suggestion. Consider driver availability, vehicle status, location, and historical data of previously served similar requests. Return the response as JSON.
`,
});

const suggestDriversAndVehiclesFlow = ai.defineFlow(
  {
    name: 'suggestDriversAndVehiclesFlow',
    inputSchema: SuggestDriversAndVehiclesInputSchema,
    outputSchema: SuggestDriversAndVehiclesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
