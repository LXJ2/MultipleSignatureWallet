
export default function Footer() {
  return (
    <footer>
      <div className="mx-auto px-4 sm:px-6 max-w-7xl mt-[100px]">
        {/* Bottom area */}
        <div className="md:flex md:items-center md:justify-between py-4 md:py-8 border-t border-[#D6FBFE]">

          {/* Social as */}
          <div className="flex mb-4 md:order-1 md:ml-4 md:mb-0 text-sm text-gray-600 mr-4">
            This site is protected by reCAPTCHA and the Google &nbsp;<a href="https://policies.google.com/privacy" target='_blank' style={{ color: '#8B51F7' }}>Privacy Policy</a> &nbsp;and &nbsp;<a href="https://policies.google.com/terms" target='_blank' style={{ color: '#8B51F7' }}>Terms of Service</a> &nbsp;apply.
          </div>

          {/* Copyrights note */}
          <div className="text-sm text-gray-600 mr-4">&copy; Cruip.com. All rights reserved.</div>

        </div>

      </div>
    </footer>
  )
}
