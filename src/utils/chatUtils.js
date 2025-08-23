import toast from 'react-hot-toast';

/**
 * Starts a new chat session with a user and navigates to the chat view
 * @param {Object} supabase - The Supabase client
 * @param {string} userId - The user's ID
 * @param {Function} navigate - React Router's navigate function
 */
export const startNewChat = async (supabase, userId, navigate) => {
  try {
    if (!supabase || !userId) {
      throw new Error('Missing required parameters');
    }

    // First, check if the user has an active session
    const { data: existingSessions, error: sessionError } = await supabase
      .from('sessions')
      .select('id')
      .eq('user_id', userId)
      .eq('status', 'active')
      .order('started_at', { ascending: false })
      .limit(1);

    if (sessionError) throw sessionError;

    // If there's an active session, navigate to it
    if (existingSessions && existingSessions.length > 0) {
      toast.success('Navigating to existing active session');
      navigate(`/chat/${existingSessions[0].id}`);
      return;
    }

    // Create a new session
    const { data: newSession, error: createError } = await supabase
      .from('sessions')
      .insert({
        user_id: userId,
        status: 'active',
        started_at: new Date().toISOString(),
        metadata: { initiated_by: 'admin' }
      })
      .select()
      .single();

    if (createError) throw createError;

    // Navigate to the new chat
    toast.success('New chat session created');
    navigate(`/chat/${newSession.id}`);
  } catch (error) {
    console.error('Error starting chat:', error);
    toast.error(`Failed to start chat: ${error.message}`);
  }
}; 