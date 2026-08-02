import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://jzicqmbmjerglnznjwod.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp6aWNxbWJtamVyZ2xuem5qd29kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ4NTQ3ODYsImV4cCI6MjEwMDQzMDc4Nn0.z2XtAAI1cR_sa0I1wdd9GKgTX0kst4egn7cDZHvc3L0";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function createAdmin() {
  const email = "admin@sparkcelebrations.com";
  const password = "adminpassword123!";
  
  console.log('Attempting to create admin user...');
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    console.error("Error creating admin:", error.message);
  } else {
    console.log("Admin created successfully:", data);
    console.log("Email:", email);
    console.log("Password:", password);
  }
}

createAdmin();
