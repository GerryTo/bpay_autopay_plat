/**
 * Encryption Configuration
 *
 * IMPORTANT: The PRIVATE_KEY must match the $Private_Key value from your PHP server's config.php
 * This key is used together with the public key from the server to decrypt data.
 */

// Private Key from PHP server config
export const PRIVATE_KEY = '{([<.?*+-#!,>])}';

// Note: In production, consider using environment variables:
// export const PRIVATE_KEY = import.meta.env.VITE_PRIVATE_KEY || '{([<.?*+-#!,>])}';
