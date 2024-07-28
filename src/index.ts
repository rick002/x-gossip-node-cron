import cron from 'node-cron';
import axios, { AxiosRequestConfig } from 'axios';
import dotenv from 'dotenv';

dotenv.config();

interface AuthResponse {
  name: string;
  lastName: string;
  email: string;
  accessToken: string;
}

const authCredentials = {
  email: process.env.EMAIL as string,
  password: process.env.PASSWORD as string,
};

const excutionFrecuency = process.env.EXECUTION_FRECUENCY as string;
const signInUrl = process.env.X_GOSSIP_SIGN_IN_METHOD as string;
const publishUrl = process.env.X_GOSSIP_PUBLISHING_METHOD as string;

async function authenticate(): Promise<string> {
  try {
    const response = await axios.post<AuthResponse>(signInUrl, authCredentials);
    return response.data.accessToken;
  } catch (error) {
    console.error('Error trying to authenticate: ', (error as Error).message);
    throw error;
  }
}

async function publish(accessToken: string): Promise<void> {
  try {
    const config: AxiosRequestConfig<any> = { headers: { Authorization: `Bearer ${accessToken}` } };
    const response = await axios.post(publishUrl, {}, config);
    console.log('Publishing mechaniscm triggered successfully:', response.data);
  } catch (error) {
    console.error('Error trying to trigger the publishing mechanisim:', (error as Error).message);
  }
}

cron.schedule(excutionFrecuency, async () => {
  try {
    console.log('Triggering authentication and publishing process...');
    const accessToken = await authenticate();
    await publish(accessToken);
  } catch (error) {
    console.error('Error trying to trigger the authentication and publishing process:', (error as Error).message);
  }
});

console.log('This CronJob is triggered to call the X-Gossip-API every hour');

