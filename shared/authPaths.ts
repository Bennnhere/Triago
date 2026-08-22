export type OAuthFailure = "missing_parameters" | "invalid_state" | "callback_failed";

export function getPostOAuthPath(returnTo?: string) {
  return returnTo === "/app" ? "/app" : "/";
}

export function getOAuthFailurePath(reason: OAuthFailure) {
  return `/login?error=${reason}`;
}

export function getOAuthFailureMessage(reason: string | null) {
  switch (reason) {
    case "invalid_state":
      return "Your secure sign-in request expired or could not be verified. Please start again.";
    case "missing_parameters":
      return "The sign-in response was incomplete. Please start again.";
    case "callback_failed":
      return "Triago could not complete your sign-in. Please try again.";
    default:
      return null;
  }
}
