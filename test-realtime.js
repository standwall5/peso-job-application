/**
 * Real-Time Chat Test Script
 *
 * This script tests if Supabase real-time is properly configured for the chat system.
 *
 * Usage:
 * 1. Make sure you have your environment variables set up (.env.local)
 * 2. Run: node test-realtime.js
 *
 * The script will:
 * - Connect to Supabase
 * - Subscribe to chat_messages table
 * - Subscribe to chat_sessions table
 * - Report if real-time is working
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ ERROR: Missing environment variables!');
  console.error('Make sure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set in .env.local');
  process.exit(1);
}

console.log('🔧 Initializing Supabase client...');
const supabase = createClient(supabaseUrl, supabaseAnonKey);

console.log('✅ Supabase client created');
console.log(`📍 URL: ${supabaseUrl}`);
console.log('');

let messagesReceived = 0;
let sessionsReceived = 0;

console.log('🎧 Setting up real-time subscriptions...');
console.log('');

// Test chat_messages subscription
const messagesChannel = supabase
  .channel('test-messages-channel')
  .on(
    'postgres_changes',
    {
      event: '*',
      schema: 'public',
      table: 'chat_messages'
    },
    (payload) => {
      messagesReceived++;
      console.log('📨 REAL-TIME EVENT RECEIVED from chat_messages:');
      console.log(`   Event: ${payload.eventType}`);
      console.log(`   Message ID: ${payload.new?.id || 'N/A'}`);
      console.log(`   Sender: ${payload.new?.sender || 'N/A'}`);
      console.log(`   Text: ${payload.new?.message?.substring(0, 50) || 'N/A'}...`);
      console.log('');
    }
  )
  .subscribe((status, err) => {
    if (status === 'SUBSCRIBED') {
      console.log('✅ Successfully subscribed to chat_messages table');
    } else if (status === 'CHANNEL_ERROR') {
      console.error('❌ Error subscribing to chat_messages:', err);
    } else if (status === 'TIMED_OUT') {
      console.error('⏱️  Subscription to chat_messages timed out');
    } else {
      console.log(`ℹ️  chat_messages subscription status: ${status}`);
    }
  });

// Test chat_sessions subscription
const sessionsChannel = supabase
  .channel('test-sessions-channel')
  .on(
    'postgres_changes',
    {
      event: '*',
      schema: 'public',
      table: 'chat_sessions'
    },
    (payload) => {
      sessionsReceived++;
      console.log('📨 REAL-TIME EVENT RECEIVED from chat_sessions:');
      console.log(`   Event: ${payload.eventType}`);
      console.log(`   Session ID: ${payload.new?.id || 'N/A'}`);
      console.log(`   Status: ${payload.new?.status || 'N/A'}`);
      console.log(`   Concern: ${payload.new?.concern?.substring(0, 50) || 'N/A'}...`);
      console.log('');
    }
  )
  .subscribe((status, err) => {
    if (status === 'SUBSCRIBED') {
      console.log('✅ Successfully subscribed to chat_sessions table');
    } else if (status === 'CHANNEL_ERROR') {
      console.error('❌ Error subscribing to chat_sessions:', err);
    } else if (status === 'TIMED_OUT') {
      console.error('⏱️  Subscription to chat_sessions timed out');
    } else {
      console.log(`ℹ️  chat_sessions subscription status: ${status}`);
    }
  });

console.log('');
console.log('⏳ Waiting for real-time events...');
console.log('');
console.log('📝 To test this:');
console.log('   1. Open your application in a browser');
console.log('   2. Start a chat or send a message');
console.log('   3. Watch this console for real-time events');
console.log('');
console.log('💡 Tips:');
console.log('   - If you see "Successfully subscribed" messages above, real-time is enabled ✅');
console.log('   - If you see timeout or error messages, check Supabase Dashboard → Database → Replication');
console.log('   - Make sure to enable replication for chat_messages and chat_sessions tables');
console.log('');
console.log('Press Ctrl+C to exit');
console.log('━'.repeat(80));
console.log('');

// Summary report every 10 seconds
setInterval(() => {
  const now = new Date().toLocaleTimeString();
  console.log(`📊 [${now}] Status Report:`);
  console.log(`   Messages received: ${messagesReceived}`);
  console.log(`   Sessions received: ${sessionsReceived}`);
  console.log('');
}, 10000);

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('');
  console.log('🛑 Shutting down...');
  await messagesChannel.unsubscribe();
  await sessionsChannel.unsubscribe();
  console.log('');
  console.log('📊 Final Statistics:');
  console.log(`   Total messages events: ${messagesReceived}`);
  console.log(`   Total sessions events: ${sessionsReceived}`);
  console.log('');
  console.log('👋 Goodbye!');
  process.exit(0);
});
