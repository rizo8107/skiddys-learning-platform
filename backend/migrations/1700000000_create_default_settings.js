/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const collection = db.collection('settings');
  if (!collection) {
    // Create settings collection if it doesn't exist
    db.createCollection({
      name: 'settings',
      type: 'base',
      system: false,
      schema: [
        {
          name: 'site_name',
          type: 'text',
          required: true,
        },
        {
          name: 'site_description',
          type: 'text',
          required: false,
        },
        {
          name: 'site_logo',
          type: 'file',
          required: false,
        },
        {
          name: 'contact_email',
          type: 'email',
          required: true,
        },
        {
          name: 'social_links',
          type: 'json',
          required: false,
        },
      ],
    });
  }

  // Create default settings record if none exists
  const settings = db.collection('settings').getFirstListItem('');
  if (!settings) {
    db.collection('settings').create({
      site_name: "Skiddy's Learning Platform",
      site_description: "Learn and grow with Skiddy's comprehensive courses",
      contact_email: "support@skiddytamil.in",
      social_links: JSON.stringify({
        twitter: "https://twitter.com/skiddytamil",
        github: "https://github.com/skiddytamil",
        linkedin: "https://linkedin.com/in/skiddytamil"
      })
    });
  }

  return true;
}, (db) => {
  // Optional: Add code for reverting the migration
  const collection = db.collection('settings');
  if (collection) {
    db.deleteCollection('settings');
  }
  return true;
});
