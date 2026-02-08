import { builder } from './builder.js';

// Import all type definitions
import './types/navigation.js';
import './types/evidence.js';
import './types/content.js';
import './types/user.js';
import './types/auth.js';
import './types/validation.js';

// Build and export the schema
export const schema = builder.toSchema();
