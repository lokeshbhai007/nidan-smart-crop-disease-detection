// components/footer.jsx
export default function Footer() {
  return (
    <footer className="bg-green-800 text-white py-8">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">SmartCrop</h3>
            <p className="text-green-200 text-sm">
              AI-powered crop disease detection for modern farmers.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm text-green-200">
              <li><a href="/" className="hover:text-white transition-colors">Home</a></li>
              <li><a href="/detection" className="hover:text-white transition-colors">Disease Detection</a></li>
              <li><a href="/chatbot" className="hover:text-white transition-colors">AI Assistant</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Support</h4>
            <ul className="space-y-2 text-sm text-green-200">
              <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Connect</h4>
            <p className="text-green-200 text-sm">
              Join our community of farmers and agricultural experts.
            </p>
          </div>
        </div>
        <div className="border-t border-green-700 mt-8 pt-8 text-center text-sm text-green-300">
          <p>&copy; 2024 Smart Crop Disease Detection. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}