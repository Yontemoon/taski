import { supabase } from "./supabase";

const userSignIn = async (email: string, password: string) => {
  try {
    const { error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (error) throw new Error("Error in userSignIn");
    return {
      success: true,
    };
  } catch (error) {
    console.error("Error in userSignIn", error);
    return { success: false };
  }
};

export { userSignIn };
