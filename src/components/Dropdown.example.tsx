// Dropdown Component Usage Examples

import Dropdown, { DropdownItem, DropdownDivider } from "./Dropdown";

/**
 * Example 1: Basic Dropdown with items
 */
function Example1() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div style={{ position: "relative" }}>
      <button onClick={() => setIsOpen(!isOpen)}>Toggle Dropdown</button>

      <Dropdown isOpen={isOpen} position="left">
        <DropdownItem onClick={() => console.log("Profile clicked")}>
          Profile
        </DropdownItem>
        <DropdownItem onClick={() => console.log("Settings clicked")}>
          Settings
        </DropdownItem>
        <DropdownDivider />
        <DropdownItem onClick={() => console.log("Logout clicked")}>
          Logout
        </DropdownItem>
      </Dropdown>
    </div>
  );
}

/**
 * Example 2: Dropdown with Icons
 */
function Example2() {
  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <div style={{ position: "relative" }}>
      <button onClick={() => setShowNotifications(!showNotifications)}>
        Notifications
      </button>

      <Dropdown isOpen={showNotifications} position="center">
        <DropdownItem
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4z" />
            </svg>
          }
          onClick={() => console.log("New message")}
        >
          New message from John
        </DropdownItem>
        <DropdownItem
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z" />
            </svg>
          }
          onClick={() => console.log("Security alert")}
        >
          Security alert
        </DropdownItem>
      </Dropdown>
    </div>
  );
}

/**
 * Example 3: Dropdown with Links
 */
function Example3() {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div style={{ position: "relative" }}>
      <button onClick={() => setShowMenu(!showMenu)}>Menu</button>

      <Dropdown isOpen={showMenu} position="right">
        <DropdownItem href="/dashboard">Dashboard</DropdownItem>
        <DropdownItem href="/profile">My Profile</DropdownItem>
        <DropdownItem href="/settings">Settings</DropdownItem>
        <DropdownDivider />
        <DropdownItem href="/logout">Logout</DropdownItem>
      </Dropdown>
    </div>
  );
}

/**
 * Props Documentation:
 *
 * Dropdown Component:
 * - children: ReactNode - The dropdown items/content
 * - isOpen: boolean - Controls visibility
 * - position?: "left" | "center" | "right" - Horizontal alignment (default: "left")
 * - className?: string - Additional CSS classes
 *
 * DropdownItem Component:
 * - children: ReactNode - The item content/text
 * - onClick?: () => void - Click handler
 * - href?: string - If provided, renders as link
 * - icon?: ReactNode - Optional icon (usually SVG)
 * - className?: string - Additional CSS classes
 *
 * DropdownDivider Component:
 * - className?: string - Additional CSS classes
 *
 * Features:
 * ✅ Modern rounded corners (12px border-radius)
 * ✅ Smooth slide-down animation
 * ✅ Hover effect with var(--accent) color
 * ✅ Clean shadow-based design
 * ✅ Keyboard accessible (Enter/Space)
 * ✅ Position variants (left, center, right)
 * ✅ Support for icons
 * ✅ Support for both buttons and links
 */
