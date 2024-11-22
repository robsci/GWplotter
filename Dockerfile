FROM nginx:alpine

COPY ./ /usr/share/nginx/html/

# Expose port 80 for the container
EXPOSE 80

# Start Nginx when the container runs
CMD ["nginx", "-g", "daemon off;"]

