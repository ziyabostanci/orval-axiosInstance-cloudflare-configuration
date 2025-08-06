# orval-axiosInstance-cloudflare-configuration
🛠️ Fixing Illegal invocation in Cloudflare Pages (Workers) When Using Axios + Orval
When using Orval with a custom Axios instance inside a Cloudflare Pages (i.e., Cloudflare Workers) environment, you may encounter the following error:
TypeError: Illegal invocation: function called with incorrect `this` reference.
📌 Problem
This is caused by how the Cloudflare Workers runtime handles AbortController.abort(). It throws an error because the internal this reference is incorrect in that context.

Tested On
✅ Cloudflare Pages (Workers)

✅ Vercel (Node)

✅ Local dev (Next.js)

