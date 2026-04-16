import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { code } = await req.json()
    
    if (!code) {
      return new Response(
        JSON.stringify({ error: 'Discount code is required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    // Get Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    // Query discount code
    const { data, error } = await supabaseClient
      .from('app_24de_discount_codes')
      .select('discount_percent, is_active, valid_until')
      .eq('code', code.toUpperCase())
      .single()

    if (error || !data) {
      return new Response(
        JSON.stringify({ valid: false, message: 'Invalid discount code' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { discount_percent, is_active, valid_until } = data
    
    // Check if code is active and not expired
    const now = new Date()
    const valid = is_active && (!valid_until || new Date(valid_until) > now)
    
    if (!valid) {
      return new Response(
        JSON.stringify({ valid: false, message: 'Discount code is expired or inactive' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ 
        valid: true, 
        discount_percent,
        message: `Discount ${discount_percent}% applied successfully`
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})