import { UserType } from '@/types';
import { atomWithStorage } from 'jotai/utils'


// Initial state is null when no user is logged in
const initialUserState: UserType | null = null;

// Create the user atom to store user data
export const userAtom = atomWithStorage<UserType | null>("info", initialUserState);
export const tokenAtom = atomWithStorage<string | null>("token", null);
