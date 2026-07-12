import styles from "./PaperPlaneLoader.module.css";

export default function PaperPlaneLoader() {
  return (
    <main
      className={styles.loadingScreen}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div className={styles.backgroundGlow} aria-hidden="true" />

      <div className={styles.loaderContent}>
        <div className={styles.animationStage} aria-hidden="true">
          <svg
            className={styles.animation}
            viewBox="0 0 360 230"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <linearGradient
                id="linkPilotGradient"
                x1="0"
                y1="0"
                x2="1"
                y2="1"
              >
                <stop offset="0%" className={styles.gradientStart} />
                <stop offset="55%" className={styles.gradientMid} />
                <stop offset="100%" className={styles.gradientEnd} />
              </linearGradient>

              <filter
                id="planeShadow"
                x="-50%"
                y="-50%"
                width="200%"
                height="200%"
              >
                <feDropShadow
                  dx="0"
                  dy="8"
                  stdDeviation="8"
                  className={styles.planeShadowColor}
                  floodOpacity="0.25"
                />
              </filter>
            </defs>

            {/* Curved travel route */}
            <path
              className={styles.route}
              d="M74 158 C120 65 239 61 288 137"
              pathLength="1"
            />

            {/* Starting link node */}
            <g className={styles.startNode}>
              <circle
                className={styles.startNodePulse}
                cx="72"
                cy="158"
                r="31"
              />

              <circle cx="72" cy="158" r="24" fill="url(#linkPilotGradient)" />

              <g
                fill="none"
                stroke="#ffffff"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M66 151.5 62.5 155a8 8 0 0 0 11.3 11.3l4-4" />

                <path d="m78 164.5 3.5-3.5a8 8 0 0 0-11.3-11.3l-4 4" />

                <path d="m68 162 8-8" />
              </g>
            </g>

            {/* Small particles behind the paper plane */}
            <g className={styles.trailParticles}>
              <circle cx="82" cy="151" r="3.5" />
              <circle cx="95" cy="134" r="3" />
              <circle cx="109" cy="119" r="2.5" />
              <circle cx="124" cy="106" r="2" />
            </g>

            {/* Flying paper plane */}
            <g className={styles.paperPlane} filter="url(#planeShadow)">
              <path
                d="M-21 -11 25 0-21 12-12 2-21-11Z"
                fill="url(#linkPilotGradient)"
              />

              <path d="m-12 2 37-2-29 11Z" fill="#6d28d9" opacity="0.8" />

              <path d="M-12 2 25 0-8-4Z" fill="#a78bfa" opacity="0.75" />

              <path
                d="m-12 2 7 14 5-12"
                fill="none"
                stroke="#ffffff"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity="0.9"
              />
            </g>

            {/* Destination node */}
            <g className={styles.destinationNode}>
              <circle
                className={styles.destinationRipple}
                cx="290"
                cy="138"
                r="29"
              />

              <circle
                className={styles.destinationCircle}
                cx="290"
                cy="138"
                r="23"
              />

              <path
                className={styles.checkmark}
                d="m280 138 7 7 14-16"
                pathLength="1"
              />
            </g>

            {/* Decorative floating dots */}
            <g className={styles.decorativeDots}>
              <circle cx="112" cy="74" r="3" />
              <circle cx="255" cy="76" r="4" />
              <circle cx="313" cy="93" r="2.5" />
              <circle cx="43" cy="112" r="2.5" />
            </g>
          </svg>

          <div className={styles.urlCard}>
            <div className={styles.browserDot} />
            <div className={styles.browserDot} />
            <div className={styles.browserDot} />

            <div className={styles.urlField}>
              <svg
                viewBox="0 0 24 24"
                aria-hidden="true"
                className={styles.urlIcon}
              >
                <path
                  d="M10.6 13.4a2 2 0 0 0 2.8 0l3-3a2 2 0 1 0-2.8-2.8L12.5 8.7"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                <path
                  d="M13.4 10.6a2 2 0 0 0-2.8 0l-3 3a2 2 0 1 0 2.8 2.8l1.1-1.1"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>

              <span>linkpilot.app/smart-link</span>
            </div>

            <div className={styles.urlProgress} />
          </div>
        </div>

        <div className={styles.brand}>
          <div className={styles.logoMark} aria-hidden="true">
            <svg viewBox="0 0 32 32">
              <path
                d="M10.5 18.5 7.7 21.3a5 5 0 0 0 7.1 7.1l4.4-4.4"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
              />

              <path
                d="m21.5 13.5 2.8-2.8a5 5 0 0 0-7.1-7.1L12.8 8"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
              />

              <path
                d="m11.5 20.5 9-9"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
              />
            </svg>
          </div>

          <span>LinkPilot</span>
        </div>

        <p className={styles.loadingMessage}>
          Preparing your smart links
          <span className={styles.loadingDots} aria-hidden="true">
            <span />
            <span />
            <span />
          </span>
        </p>
      </div>

      <span className={styles.screenReaderOnly}>
        LinkPilot is loading. Please wait.
      </span>
    </main>
  );
}
