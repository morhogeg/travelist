import React from "react";
import { Link } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";

interface BreadcrumbItem {
    label: string;
    path: string;
}

interface BreadcrumbProps {
    items: BreadcrumbItem[];
}

const Breadcrumb: React.FC<BreadcrumbProps> = ({ items }) => {
    return (
        <nav className="flex px-4 py-2 text-sm text-muted-foreground overflow-x-auto whitespace-nowrap scrollbar-hide">
            <ol className="flex items-center space-x-2">
                <li>
                    <Link to="/" className="hover:text-primary flex items-center">
                        <Home className="h-4 w-4" />
                    </Link>
                </li>
                {items.map((item, index) => (
                    <React.Fragment key={index}>
                        <ChevronRight className="h-4 w-4 shrink-0 opacity-50" />
                        <li>
                            <Link
                                to={item.path}
                                className={`hover:text-primary ${index === items.length - 1 ? "font-semibold text-foreground" : ""
                                    }`}
                            >
                                {item.label}
                            </Link>
                        </li>
                    </React.Fragment>
                ))}
            </ol>
        </nav>
    );
};

export default Breadcrumb;
