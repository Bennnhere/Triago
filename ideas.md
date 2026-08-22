# Triago Design Direction

## Three possible approaches

| Theme Name | Very Brief Intro | Probability |
| --- | --- | ---: |
| Signal Gate | A severe, split-screen operations console where a single white dividing line turns raw alert noise into legible agent reasoning. | 0.07 |
| Field Manual | A paper-inspired reliability workspace built from densely annotated operational cards and monochrome incident stamps. | 0.03 |
| Thermal Relay | A low-light control-room display organized around warm diagnostic bands and physical switchboard metaphors. | 0.09 |

## Chosen approach: Signal Gate

**Design Movement.** Signal Gate is a restrained blend of Swiss information design and mission-control instrumentation. It makes the product’s core proposition visible: raw machine noise is filtered, investigated, and converted into a decisive human-readable signal.

**Core Principles.** The interface is intentionally split, with disorder on the intake side and composed evidence on the agent side. Every visual distinction must map to operational meaning. Density is permitted in raw telemetry only; agent reasoning earns whitespace. Surfaces remain flat and technical, avoiding decorative effects that soften the monitoring-console premise.

**Color Philosophy.** The base charcoal-navy palette creates a low-light operational environment rather than a black-terminal cliché. Amber denotes active investigation, teal-green indicates autonomous resolution, and coral-red signals escalation. Pure white is reserved exclusively for the central signal-gate divider so it remains the product’s most ownable visual event.

**Layout Paradigm.** The screen is a full-height bilateral instrument, not a central dashboard. The fixed vertical aperture divides two independently scrolling operational fields. A slim status rail and scenario deck sit within the lower edge of the frame rather than creating a generic application header.

**Signature Elements.** A 2px pure-white central signal gate; monospaced evidence strips with indexed event markers; a quiet topology field that becomes denser on the incoming side and calmer on the reasoning side.

**Interaction Philosophy.** Clicking a scenario injects an alert and starts an uninterrupted, autonomous operation. Controls are deliberate and utilitarian; active states simply change the observed system rather than opening conversational flows. The trace presents thought, action, observation, and decision as evidence, not as chat bubbles.

**Animation.** On load, only the white gate draws down the viewport before both panels reveal from it. Later changes use only brief opacity transitions for trace entries and scenario state updates. The experience honors reduced-motion settings.

**Typography System.** Space Grotesk is used in all labels, headings, counters, and status chrome with firm tracking and compact uppercase. IBM Plex Mono renders all event data and reasoning trace lines. No third typeface or system-font fallback is permitted.

**Brand Essence.** Triago is the autonomous reliability filter for lean engineering teams that need complete investigations rather than more notifications. Personality: exacting, composed, accountable.

**Brand Voice.** Headlines state an operational fact. CTAs trigger a real system event. Example lines: “Noise enters. Evidence exits.” and “Run known checkout failure.”

**Wordmark & Logo.** The mark is an abstract signal gate: multiple incoming paths compress through a narrow aperture and emerge as one clean pulse. The wordmark follows as spaced Space Grotesk lettering, never as a default text treatment.

**Signature Brand Color.** Signal Gate White: `#FFFFFF`, deliberately used only for the central divider.

## Style Decisions

- The center divider is the brightest and most structurally dominant element; every other surface, type treatment, border, and icon is cool off-white or muted slate.
- The left panel deliberately carries tighter, denser telemetry strips and a more visible topology field, while the right panel uses greater trace spacing and a calmer surface.
- The “many inputs, one resolved pulse” geometry recurs in the center gate, fallback mark, dense incoming rails, and the semantic left border of each lower scenario control.
- The user-mandated Triago name supersedes the original exploratory naming. The landing hero and command-center overview now make the intake → gate → composed output transformation an explicit primary composition.
- Pure white is retained only in the temporary entrance aperture and the static gate motifs; content hierarchy otherwise uses cool off-white, slate, and semantic teal, amber, coral, and violet.
- Triago’s color system is now Deep Navy `#0A2947` as the dominant foundation, Warm Cream `#F3E4C9` for readable contrast and key light surfaces, Soft Stone `#D4D3C0` for structure and supporting contrast, and Earthy Brown `#8B5E3C` for selected operational emphasis. Status tints are deliberately muted derivatives of this system.
