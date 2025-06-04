export default function SubMenu() {
    return (
        <aside className="bg-blue-700 text-white w-1/10 h-screen p-4">
            <nav>
                <ul className="space-y-4">
                    <li>
                        <a href="#" className="block text-sm hover:bg-gray-600 p-2 rounded">
                            Item 1
                        </a>
                    </li>
                    <li>
                        <a href="#" className="block text-sm hover:bg-gray-600 p-2 rounded">
                            Item 2
                        </a>
                    </li>
                    <li>
                        <a href="#" className="block text-sm hover:bg-gray-600 p-2 rounded">
                            Item 3
                        </a>
                    </li>
                    <li>
                        <a href="#" className="block text-sm hover:bg-gray-600 p-2 rounded">
                            Item 4
                        </a>
                    </li>
                </ul>
            </nav>
        </aside>
    );
}