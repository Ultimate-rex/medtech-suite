import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AuthRequest {
  action: 'login' | 'verify' | 'logout';
  username?: string;
  password?: string;
  token?: string;
}

// Simple token generation (in production use proper JWT)
function generateToken(username: string): string {
  const payload = {
    username,
    exp: Date.now() + (24 * 60 * 60 * 1000), // 24 hours
    iat: Date.now()
  };
  return btoa(JSON.stringify(payload));
}

function verifyToken(token: string): { valid: boolean; username?: string } {
  try {
    const payload = JSON.parse(atob(token));
    if (payload.exp > Date.now()) {
      return { valid: true, username: payload.username };
    }
    return { valid: false };
  } catch {
    return { valid: false };
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { action, username, password, token }: AuthRequest = await req.json();
    console.log(`Auth action: ${action}`);

    switch (action) {
      case 'login': {
        if (!username || !password) {
          return new Response(JSON.stringify({ 
            success: false, 
            error: 'Username and password required' 
          }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        // Check admin credentials
        const { data: admin, error } = await supabase
          .from('admin_users')
          .select('*')
          .eq('username', username)
          .single();

        if (error || !admin) {
          console.log('Admin not found:', username);
          return new Response(JSON.stringify({ 
            success: false, 
            error: 'Invalid credentials' 
          }), {
            status: 401,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        // Simple password check (in production, use bcrypt)
        if (admin.password_hash !== password) {
          console.log('Password mismatch for:', username);
          return new Response(JSON.stringify({ 
            success: false, 
            error: 'Invalid credentials' 
          }), {
            status: 401,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        const authToken = generateToken(username);
        console.log('Login successful for:', username);

        return new Response(JSON.stringify({ 
          success: true, 
          token: authToken,
          username: admin.username
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'verify': {
        if (!token) {
          return new Response(JSON.stringify({ 
            success: false, 
            error: 'Token required' 
          }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        const result = verifyToken(token);
        return new Response(JSON.stringify({ 
          success: result.valid,
          username: result.username
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'logout': {
        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      default:
        return new Response(JSON.stringify({ 
          success: false, 
          error: 'Unknown action' 
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }
  } catch (error) {
    console.error('Auth error:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});