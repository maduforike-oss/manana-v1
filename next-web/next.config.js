/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: false // Use pages router
  },
  images: {
    domains: ['ajnbtevgzhkilokflntj.supabase.co']
  }
}

module.exports = nextConfig