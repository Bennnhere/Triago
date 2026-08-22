# Animation Revision

- [x] Review `pasted_content_4.txt` and map its requirements to the current Triago application.
- [x] Implement the user-approved Manus OAuth replacement while preserving unaffected Triago workflows.
- [ ] Validate the revised experience and checkpoint the changes.

> Blocked: the uploaded module contains only mock localStorage credentials and placeholder social-login actions; it does not include a reusable Google OAuth, session, callback, token, or logout implementation. Obtain the actual authentication module or approval for an alternative before integrating.

> Resolution: the user approved the built-in Manus OAuth alternative. The new Triago login page intentionally retains the supplied module’s two-panel sign-in visual premise while adapting it to the existing secure Manus callback and session system.

## Authorized Google OAuth integration

- [x] Inspect the uploaded login module and confirm that its social button is a placeholder rather than a real provider flow.
- [ ] Enable secure server-side authentication and secret storage for Google OAuth configuration.
- [ ] Reuse the supplied login design with a real Google Identity action, loading state, and configuration error handling.
- [ ] Verify Google identity tokens server-side, issue an HTTP-only persistent session, and protect `/app`.
- [ ] Add minimal session-aware landing CTAs and a logout action in the existing command center.
- [ ] Build, test protected routing and unaffected FastAPI/WebSocket agent workflows, then checkpoint and push.

## Approved Manus OAuth replacement

- [x] Obtain explicit approval to use the project’s built-in Manus OAuth instead of direct Google OAuth.
- [x] Remove direct-Google-only implementation and dependencies that are no longer needed.
- [x] Connect the supplied login surface to the built-in Manus OAuth start and callback flow.
- [x] Preserve authenticated redirects, persistent sessions, protected `/app`, and logout controls.
- [ ] Validate the Manus OAuth lifecycle, responsive login surface, live FastAPI/WebSocket workflows, build, checkpoint, and GitHub push.

- [x] Inspect the GitHub repository relationship and current source-control status.
- [x] Stage the complete Triago source set while excluding generated and local-only artifacts.
- [x] Commit and push the current application revision to the selected GitHub repository.

- [x] Inspect the existing Breaks-specific hero markup and motion rules.
- [x] Add a subtle, palette-aligned shimmer only to the word “Breaks”.
- [x] Verify desktop/mobile layout stability, reduced-motion behavior, and unchanged landing animations.

- [x] Review `pasted_content_3.txt` and translate its requirements into Triago changes.
- [x] Implement the approved specification updates without regressing the existing Triago experience unless explicitly overridden.
- [x] Validate the resulting product and checkpoint the revision.

- [x] Remove the white center line at the exact moment Triago’s black panels start splitting.
- [x] Verify the revised opening and checkpoint the animation update.

- [x] Align the white center-line removal with the instant the black entrance panels clear the viewport.
- [x] Verify the synchronized entrance sequence and checkpoint the change.

- [x] Inspect Triago’s current components, routing, data model, and interaction flows.
- [x] Write a complete explanation of the website workflow and each component’s purpose.
- [x] Deliver the structured reference document.

- [x] Remove the hero’s “Autonomous Incident Response” eyebrow component.
- [x] Style only “Breaks” in the hero headline with Copperplate in white.
- [x] Verify the refined landing hero and checkpoint the update.

- [x] Define semantic Triago tokens from the specified navy, cream, stone, and brown palette.
- [x] Apply the color system across landing, navigation, dashboard, incident, chart, notification, and simulator surfaces.
- [x] Verify contrast, desktop/mobile rendering, and checkpoint the palette revision.

- [x] Review `pasted_content_2.txt` and translate its requirements into Triago changes.
- [x] Implement the approved requirements without regressing the cinematic entrance sequence.
- [x] Verify the resulting experience and checkpoint the update.

- [x] Hold the Triago entrance overlay completely black through 0.7 seconds.
- [x] Run the horizontal black-panel split and center-line reveal from 0.7 to 1.8 seconds.
- [x] Hold the cleared split and white line through the 2.5–3.0 second settle window, then remove all entrance elements.
- [x] Verify the retimed sequence and checkpoint the revision.

- [x] Rename all visible product identity to Triago.
- [x] Render the landing page behind a full-viewport black entrance overlay.
- [x] Split the overlay vertically into upper and lower black panels around a temporary white center line.
- [x] Sequence the opening, two-second revealed hold, smooth line removal, and reduced-motion fallback.
- [x] Verify desktop, tablet, and mobile behavior, then checkpoint the update.

- [x] Replace the persistent vertical divider with a temporary white gate.
- [x] Change the entrance choreography from left/right panels to top/bottom panels over two seconds.
- [x] Begin on a pure black canvas and fade the gate away after panel settling.
- [x] Verify the complete sequence visually and checkpoint the revision.
