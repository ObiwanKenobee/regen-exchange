import { createMiddleware } from "@tanstack/react-start";
import { getWebRequest } from "@tanstack/react-start/server";

// Simple authentication middleware for server functions
export const authMiddleware = createMiddleware().server(async ({ next }) => {
  const request = getWebRequest();

  // Check for authentication header (Bearer token)
  const authHeader = request.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new Error("Authentication required");
  }

  const token = authHeader.substring(7); // Remove "Bearer "

  // TODO: Validate JWT token and extract user ID
  // For now, we'll use a simple token validation
  if (!token || token.length < 10) {
    throw new Error("Invalid authentication token");
  }

  // Extract user ID from token (simplified - in production use proper JWT verification)
  const userId = token.split("-")[1]; // Assuming token format: "rve-{userId}-{timestamp}"

  if (!userId) {
    throw new Error("Invalid user ID in token");
  }

  // Add user context to the request
  return next({
    context: {
      userId,
      token,
    },
  });
});

// Helper function to get current user from context
export function getCurrentUser() {
  // This would be used in server functions to get the authenticated user
  // For now, return a placeholder
  return {
    id: "temp-user-id",
    did: "did:rve:temp",
    name: "Current User",
  };
}

// Helper function to require authentication in server functions
export function requireAuth() {
  const user = getCurrentUser();
  if (!user) {
    throw new Error("Authentication required");
  }
  return user;
}