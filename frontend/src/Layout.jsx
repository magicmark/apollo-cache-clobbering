import classNames from 'classnames';

export default function Layout({ children }) {
    return (
        <div className="min-h-screen grow relative bg-fuchsia-50">
            <div className="container mx-auto max-w-7xl">
                <div className="navbar bg-base-100 shadow-sm">
                    <p className="btn btn-ghost text-xl">Apollo Cache Playground</p>
                </div>

                <div className="container mx-auto px-4 pb-8">{children}</div>
            </div>

            <div className="fixed bottom-6 left-6 z-50 hidden md:block">
                <p>footer</p>
            </div>
        </div>
    );
}
