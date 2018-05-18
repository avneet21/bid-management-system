First I had to add 2 build packs
- Ruby and nodejs in this order
then move all grunt related dev-dependencies to dependencies

Add Bower if needed to package.json

Configure client bower in post install
Created a task for production build.
Change env variables needed for heroku like port and mongodburi.

Configure npm start acc to production and development.