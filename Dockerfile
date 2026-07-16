# Use the official lightweight Nginx Alpine base image
FROM nginx:1.25-alpine

# Set working directory to Nginx asset directory
WORKDIR /usr/share/nginx/html

# Clean any default files in conf.d and public directory
RUN rm -rf /etc/nginx/conf.d/* /usr/share/nginx/html/*

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy static assets and HTML files
COPY css/ ./css/
COPY fonts/ ./fonts/
COPY images/ ./images/
COPY js/ ./js/
COPY svg/ ./svg/
COPY index.html ./
COPY favi.ico ./
COPY zfavicon.png ./

# Document that the container listens on port 80
EXPOSE 80

# Run nginx in the foreground
CMD ["nginx", "-g", "daemon off;"]
