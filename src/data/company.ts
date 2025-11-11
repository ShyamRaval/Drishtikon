// Company data - information that doesn't change often or at all
// (address, phone numbers, email, social media links, etc.)

export const companyData = {
  name: "Drishtikon",
  email: "hello@drishtikon.studio",
  phone: {
    primary: "90813 22508",
    secondary: "90546 22508",
  },
  social: {
    instagram: {
      handle: "@drishtikonstudio",
      url: "https://instagram.com/drishtikonstudio",
    },
  },
  location: {
    city: "Ahmedabad",
    state: "Gujarat",
    country: "India",
  },
} as const;

