# Changelog

All notable changes to MotionForge will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.2.0] - 2024-01-15

### Added
- Frame caching system with LRU cache and TTL support
- Video export with WebM encoding (MediaRecorder API)
- Canvas-based frame capture renderer
- Performance optimization hooks
- Enhanced render API with job management
- Progress tracking for video exports

### Changed
- Improved performance with memoization
- Better TypeScript type definitions
- Optimized frame rendering pipeline

## [1.1.0] - 2024-01-10

### Added
- 3D Transform effects (Rotate3D, Flip3D, Perspective3D, Cube3D)
- Particle system with multiple shapes and directions
- Text animation effects (LetterByLetter, WordByWord, WaveText, RainbowText, GradientText)
- Additional effects (Blur, Bounce, Pulse, Swing, Confetti)
- 3 new demo compositions
- AI Agent guidelines (GLM AI & Google AI)

### Changed
- Updated theme with emerald green accents
- Improved demo player with better controls
- Enhanced icon library with 50+ icons

## [1.0.0] - 2024-01-01

### Added
- Initial release
- Core video components (AbsoluteFill, Sequence, Loop, Freeze, Retiming, Reverse, Series)
- Spring physics animation system
- 20+ easing functions
- Interpolation utilities for values and colors
- Media components (Video, Audio, Img, SVG)
- Interactive timeline player
- Effect components (Fade, Scale, Slide, Rotate, Typewriter, Counter, etc.)
- Transition effects (fade, slide, wipe, flip, zoom)
- Server-side render API
- Icon library with 50+ icons
- Dark theme with green accents
