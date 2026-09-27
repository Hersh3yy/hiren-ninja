# Experiments

This directory contains interactive prototypes and creative coding experiments built with Nuxt 4 and modern web technologies.

## Current Experiments

### LED Sculpture Generator
**Location**: `/experiments/led-sculpture-generator`
**Status**: Active Prototype
**Technologies**: Vue 3, Three.js, WebGL, Nuxt 4

A parametric 3D curve generation tool for creating LED light sculptures. Features real-time visualization, parameter tweaking, and export capabilities.

**Features:**
- Real-time 3D visualization with Three.js
- Parametric curve generation with customizable properties
- Export to PNG (screenshots) and JSON (3D data for Blender)
- Interactive parameter controls for bend intensity, spiral factors, and randomization
- Mobile-responsive design with tabbed interface
- Seeded random generation for reproducible results

**Usage:**
1. Visit `/experiments/led-sculpture-generator`
2. Adjust parameters in the left panel (desktop) or Controls tab (mobile)
3. View real-time updates in the 3D viewer
4. Export your design as PNG or JSON from the Export panel

## Architecture

### Directory Structure
```
app/
├── pages/experiments/
│   ├── index.vue                    # Main experiments landing page
│   └── led-sculpture-generator/
│       └── index.vue               # LED generator main page
├── components/experiments/
│   ├── ExperimentCollapsible.vue   # Collapsible experiment cards
│   ├── ExportOption.vue           # Export button component
│   ├── ParameterSection.vue       # Parameter grouping component
│   ├── ParameterSlider.vue        # Slider input component
│   └── led-sculpture/
│       ├── ThreeViewer.vue         # 3D visualization component
│       ├── ParameterPanel.vue      # Controls panel
│       └── ExportPanel.vue         # Export options panel
├── composables/experiments/
│   ├── useLEDSculpture.js         # Main LED sculpture logic
│   └── useExporter.js             # Export functionality
├── utils/experiments/
│   └── curvemath.js               # Mathematical utilities
└── layouts/
    └── experiment.vue              # Layout for experiment pages
```

### Key Features
- **Collapsible Interface**: Only one experiment can be open at a time on the main page
- **Mobile Responsive**: Tabbed interface for mobile devices
- **Real-time Updates**: Parameters update the visualization immediately (debounced)
- **Export System**: Multiple export formats with metadata
- **Seeded Generation**: Reproducible results using random seeds

## Adding New Experiments

1. Create a new directory in `app/pages/experiments/`
2. Add experiment metadata to the `experiments` array in `app/pages/experiments/index.vue`
3. Create components in `app/components/experiments/[experiment-name]/`
4. Add composables in `app/composables/experiments/` if needed
5. Use the experiment layout: `<NuxtLayout name="experiment">`

## Technical Notes

- Built with Nuxt 4 compatibility features
- Uses Three.js for 3D rendering with WebGL
- Implements proper cleanup for Three.js resources
- Mobile-first responsive design
- Performance optimized with debounced updates
- Follows Vue 3 Composition API patterns

## Future Experiments

The framework is designed to easily accommodate new experiments:
- Generative art tools
- Interactive data visualizations  
- Creative coding prototypes
- Technical demonstrations
- Client project prototypes
