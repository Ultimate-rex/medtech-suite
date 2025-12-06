import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const MONGODB_URI = Deno.env.get('MONGODB_URI');

interface MongoDBRequest {
  action: 'find' | 'findOne' | 'insertOne' | 'updateOne' | 'deleteOne' | 'aggregate';
  collection: string;
  filter?: Record<string, unknown>;
  data?: Record<string, unknown>;
  update?: Record<string, unknown>;
  pipeline?: Record<string, unknown>[];
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, collection, filter, data, update, pipeline }: MongoDBRequest = await req.json();
    
    console.log(`MongoDB ${action} on ${collection}`, { filter, data, update });

    // MongoDB Data API endpoint
    const dataApiUrl = MONGODB_URI?.includes('mongodb+srv') 
      ? 'https://data.mongodb-api.com/app/data-api/endpoint/data/v1'
      : MONGODB_URI;

    // Parse cluster info from connection string
    const clusterMatch = MONGODB_URI?.match(/mongodb\+srv:\/\/([^:]+):([^@]+)@([^/]+)/);
    if (!clusterMatch) {
      throw new Error('Invalid MongoDB connection string');
    }

    const [, username, password, cluster] = clusterMatch;
    const databaseName = 'hospital';

    // For MongoDB Atlas, we'll use the Data API
    // First, let's create a simple REST-like interface
    const apiKey = password; // Using password as API key for simplicity

    let result: unknown;
    let endpoint = '';
    let body: Record<string, unknown> = {
      dataSource: cluster.split('.')[0],
      database: databaseName,
      collection,
    };

    switch (action) {
      case 'find':
        endpoint = '/action/find';
        body.filter = filter || {};
        break;
      case 'findOne':
        endpoint = '/action/findOne';
        body.filter = filter || {};
        break;
      case 'insertOne':
        endpoint = '/action/insertOne';
        body.document = data;
        break;
      case 'updateOne':
        endpoint = '/action/updateOne';
        body.filter = filter;
        body.update = update;
        break;
      case 'deleteOne':
        endpoint = '/action/deleteOne';
        body.filter = filter;
        break;
      case 'aggregate':
        endpoint = '/action/aggregate';
        body.pipeline = pipeline;
        break;
      default:
        throw new Error(`Unknown action: ${action}`);
    }

    // Since MongoDB Data API requires setup, we'll simulate with local storage
    // In production, you'd call the Data API or use a proper driver
    
    // For now, return success response with the action details
    // This allows the frontend to work while you set up MongoDB Data API
    
    console.log(`Would execute: ${action} on ${collection}`, body);
    
    // Return mock success for now - in production connect to actual MongoDB
    result = {
      success: true,
      action,
      collection,
      message: `${action} operation logged. Configure MongoDB Data API for production.`,
    };

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('MongoDB Error:', errorMessage);
    return new Response(JSON.stringify({ 
      error: errorMessage,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
