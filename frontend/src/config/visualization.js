// Single source of truth for the "Room" and "Furniture" visualization modes
// on the Artwork Detail page.
//
// HOW TO ADD YOUR REAL PHOTOS
// ----------------------------------------------------------------------------
// 1. Drop your images into:
//      public/rooms/living-room.jpg
//      public/rooms/bedroom.jpg
//      public/rooms/office.jpg
//      public/rooms/hallway.jpg
//
//      public/furniture/sofa.png
//      public/furniture/bed.png
//      public/furniture/desk.png
//      public/furniture/dining-table.png
//
//    (Vite serves anything in /public at the site root, so a file at
//    public/rooms/living-room.jpg is reachable at /rooms/living-room.jpg —
//    that's exactly the `image` path used below. You can use .jpg/.png/.webp,
//    just update the extension in the path if it differs.)
//
// 2. That's it — RoomView / FurnitureView read from these arrays, so the new
//    photos show up automatically with no other code changes.
//
// HOW THE SCALING WORKS
// ----------------------------------------------------------------------------
// Each entry has a `referenceHeightCm`: the real-world height of something
// already visible in that photo (a doorway, a sofa back, a desk). The
// artwork's own dimensions_h_cm are compared against that reference to size
// it believably against the photo. If you swap in a photo where the
// reference object is a different real height, just update the number —
// no other code needs to change.

export const ROOM_SCENES = [
  {
    key: 'living_room',
    label: 'Living Room',
    image: '/rooms/living-room1.jpg',
    referenceHeightCm: 210,
    referenceLabel: 'Standard 210cm doorway',
  },
  {
    key: 'bedroom',
    label: 'Bedroom',
    image: '/rooms/bedroom1.jpg',
    referenceHeightCm: 210,
    referenceLabel: 'Standard 210cm doorway',
  },
  {
    key: 'office',
    label: 'Office',
    image: '/rooms/office1.jpg',
    referenceHeightCm: 210,
    referenceLabel: 'Standard 210cm doorway',
  },
  // {
  //   key: 'hallway',
  //   label: 'Hallway',
  //   image: '/rooms/hallway.jpg',
  //   referenceHeightCm: 210,
  //   referenceLabel: 'Standard 210cm doorway',
  // },
];

// Fallback used only if /rooms/<file> hasn't been added yet, so the page
// never shows a broken image while you're still gathering photos.
export const ROOM_FALLBACK_IMAGE = '/room-background.jpg';

export const FURNITURE_ITEMS = [
  {
    key: 'sofa',
    label: 'Above a Sofa',
    image: '/furniture/sofa1.jpg',
    referenceHeightCm: 85,
    referenceLabel: 'Sofa back height',
    hangGapCm: 20, // typical gap left between furniture top and artwork bottom
  },
  {
    key: 'bed',
    label: 'Above a Bed',
    image: '/furniture/bed1.jpg',
    referenceHeightCm: 110,
    referenceLabel: 'Headboard height',
    hangGapCm: 15,
  },
  {
    key: 'desk',
    label: 'Above a Desk',
    image: '/furniture/desk1.png',
    referenceHeightCm: 75,
    referenceLabel: 'Desk height',
    hangGapCm: 30,
  },
  {
    key: 'dining_table',
    label: 'Above a Dining Table',
    image: '/furniture/dinning1.jpg',
    referenceHeightCm: 75,
    referenceLabel: 'Table height',
    hangGapCm: 35,
  },
];

// Average adult standing height used to scale the Person Silhouette mode.
export const AVERAGE_PERSON_HEIGHT_CM = 170;
