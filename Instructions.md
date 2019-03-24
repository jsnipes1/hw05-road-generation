# Homework 5: Bless the Broken Road
Name: Jake Snipes

PennKey: jsnipes

## Images
<img src="">
All of the road segments are having a problem with connectivity, but the highways generally follow the population density map.

<img src="">
The raster neighborhoods aren't being drawn in a grid-like fashion.

## Techniques
### Terrain Map
The terrain is generated using 2D multi-octave FBM and colored based on its value such that color is linearly interpolated from blue to green. If simpleTerrain is toggled, one can view the separation between land and water as determined by a set threshold; in my opinion, this is the most useful view as it clearly separates land from water in the 2D view.

### Population Density Map
The population density map is generated using 2D Perlin noise such that lighter colors represent areas of higher population density.

### Highways
The bold roads are highways that follow the population density map and branch as appropriate. When a highway is being drawn, it samples the population density at a few points in front of it and branches if the density value is above a set threshold. The highways are drawn using a square mesh that is transformed as appropriate and rendered using instanced rendering.

### Neighborhoods
The thinner roads are neighborhoods that are drawn using a rasterization technique. They are drawn in empty blocks of land as the highway network is traversed and the areas of terrain perpendicular to them are checked. Like the highways, these are drawn using a transformed square mesh and instanced rendering.

### Connections
The highways are stored as a set of edges and intersections that is traversed after all of them are drawn and detects if there are any small adjustments that can be made to connect roads that are close to one another, trim small dead-ends, and appropriately align intersections. This technique is based on Section 3.3.1 of "Procedural Modeling of Cities."

## GUI Inputs
The modifiable GUI inputs are as follows:
- ShowTerrainMap: Toggle whether or not the noise map that governs the terrain is displayed
- SimpleTerrain: Toggle whether terrain should be colored based on its exact value (off) or whether it is land/water (on)
- ShowPopulationDensity: Toggle whether or not the noise map that governs population density is displayed
- TerrainFraction: Adjust how much of the region is land (a higher value implies more land)
- DensitySeed: Adjust how the random aspect of the population density noise map is generated (i.e. - the hash function)
- NumHighways: Adjust how many highway "roots" will be generated

## Live Demo
https://jacobsnipes.com/hw05-road-generation

## Resources Used
All resources are cited as comments in the code where they were used.