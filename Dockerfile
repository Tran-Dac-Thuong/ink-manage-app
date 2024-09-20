# Use Nginx as the base image
FROM nginx:alpine

# Copy the custom nginx configuration file to Nginx's config directory
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy the built static files from the host's dist directory to Nginx's default HTML directory
COPY ./build /usr/share/nginx/html

# Expose port 80 to the host
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]