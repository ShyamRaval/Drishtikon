export interface Project {
  slug: string; // Must match folder name in Cloudinary: Drishtikon/<slug>/
  title?: string;
  description?: string;
  category?: string;
  year?: string;
  location?: string;
  thumbnail?: string; // Cloudinary public_id basename to use as preferred thumbnail
}

export const projects: Project[] = [
  {
    slug: "Geeta Gynec Hospital, Gandhinagar",
    title: "Geeta Gynec Hospital",
    description: "Interior design for a gynecological hospital in Gandhinagar",
    category: "Healthcare",
    location: "Gandhinagar",
    thumbnail: "01",
  },
  {
    slug: "Harsh advertisement agency, Gandhinagar",
    title: "Harsh Advertisement Agency",
    description: "Office interior design for an advertisement agency in Gandhinagar",
    category: "Commercial",
    location: "Gandhinagar",
    thumbnail: "Harsh office 1 (1)",
  },
  {
    slug: "KT house, Godhrej Garden city",
    title: "KT House",
    description: "Residential interior design project in Godhrej Garden City",
    category: "Residential",
    location: "Godhrej Garden City",
    thumbnail: "Image0009_hjuj0g",
  },
  {
    slug: "Royal Revanta 3, kudasan, Gandhinagar",
    title: "Royal Revanta 3",
    description: "Residential interior design in Royal Revanta 3, Kudasan, Gandhinagar",
    category: "Residential",
    location: "Kudasan, Gandhinagar",
    thumbnail: "Rajendra bhai 1 (1)",
  },
  {
    slug: "Samvedana Neuropsychiatry Clinic",
    title: "Samvedana Neuropsychiatry Clinic",
    description: "Interior design for a neuropsychiatry clinic",
    category: "Healthcare",
    location: "Gandhinagar",
    thumbnail: "01 SAMVEDNA",
  },
];
