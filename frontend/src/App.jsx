import { print } from 'graphql';
import { gql } from '@apollo/client';
import { useQuery, useApolloClient } from '@apollo/client/react';
import { useState, useEffect, useRef, useReducer } from 'react';
import indentString from 'indent-string';

/**
 * Grab the operation name
 * e.g. `query foo { bar }` => foo
 */
const getOperationName = (document) => {
    const operationNode = document.definitions.find((d) => d.kind === 'OperationDefinition');
    return operationNode.name.value;
};

const BookWithAuthorName = gql`
    query BookWithAuthorName {
        favoriteBook {
            id
            author {
                name
            }
        }
    }
`;

const BookWithAuthorBirthdate = gql`
    query BookWithAuthorBirthdate {
        favoriteBook {
            id
            author {
                dateOfBirth
            }
        }
    }
`;

function CodeCard({ query, load }) {
    const operationName = getOperationName(query);
    return (
        <div className="card bg-base-100 w-96 shadow-sm">
            <div className="card-body">
                <pre>{print(query)}</pre>
                <div className="card-actions mt-2">
                    <button className="btn btn-primary" onClick={load}>
                        Fetch <span className="font-mono">{operationName}</span>
                    </button>
                </div>
            </div>
        </div>
    );
}

function ReadQueryCard({ query }) {
    const modalRef = useRef(null);
    const [queryCacheState, setQueryCacheState] = useState(null);
    const client = useApolloClient();
    const operationName = getOperationName(query);

    const readQueryAndShowModal = () => {
        const data = client.cache.readQuery({ query });
        setQueryCacheState(data);
        modalRef.current.showModal(); // todo: current might be null. split out the modal component.
    };

    const handleClose = () => {
        modalRef.current.close(); // todo: current might be null. split out the modal component.
    };

    const handleESC = (event) => {
        event.preventDefault();
        handleClose();
    };

    return (
        <>
            <div className="card bg-base-100 w-96 shadow-sm">
                <div className="card-body">
                    <pre>
                        <code>
                            cache.readQuery({'{\n  '}query: gql`
                            {'\n'}
                            {indentString(print(query), 4)}
                            {'  \n'}`{'}'});
                        </code>
                    </pre>
                    <div className="card-actions mt-2">
                        <button className="btn btn-primary" onClick={readQueryAndShowModal}>
                            <span className="font-mono">Read {operationName}</span>
                        </button>
                    </div>
                </div>
            </div>

            <dialog ref={modalRef} className="modal" onCancel={handleESC}>
                <div className="modal-box">
                    <h3 className="font-bold text-lg mb-2">
                        <span className="font-mono">{operationName}</span> cache value
                    </h3>
                    <pre>{JSON.stringify(queryCacheState, null, 2)}</pre>
                    <div className="modal-action">
                        <form method="dialog">
                            <button className="btn" onClick={handleClose}>
                                Close
                            </button>
                        </form>
                    </div>
                </div>
            </dialog>
        </>
    );
}

function ClearCacheState({ resetVisibility }) {
    const client = useApolloClient();
    const reset = () => {
        client.clearStore();
        resetVisibility();
    };
    return (
        <div className="card bg-base-100 shadow-sm">
            <div className="card-body">
                <p>Clear Apollo Client cache + reset state</p>
                <div className="card-actions mt-2">
                    <button className="btn btn-primary" onClick={reset}>
                        Reset state
                    </button>
                </div>
            </div>
        </div>
    );
}

function CacheState() {
    const [, forceUpdate] = useReducer((x) => x + 1, 0);

    useEffect(() => {
        // client.extract() will not recieve updates.
        // Awkwardly rerender this component every 100ms.
        const interval = setInterval(forceUpdate, 100);
        return () => clearInterval(interval);
    }, []);

    const client = useApolloClient();
    const cacheState = client.extract();
    return <pre className="text-sm mt-2">{JSON.stringify(cacheState, null, 2)}</pre>;
}

function AuthorDetailLabel({ query, getter }) {
    const { data, loading, error } = useQuery(query);

    if (loading) {
        return <p className="skeleton skeleton-text">Loading...</p>;
    }

    if (error) {
        return (
            <>
                <p>Error</p>
                <pre>{JSON.stringify(error, null, 2)}</pre>
            </>
        );
    }

    return <p>{getter(data)}</p>;
}

function AuthorDetailCard(props) {
    const { isVisible, title, ...labelProps } = props;

    return (
        <div className="card bg-base-100 w-96 shadow-sm">
            <div className="card-body">
                <h3 className="card-title">{title}</h3>
                {isVisible ? (
                    <AuthorDetailLabel {...labelProps} />
                ) : (
                    <span className="skeleton skeleton-text">Click button above to load me in</span>
                )}
            </div>
        </div>
    );
}

function App() {
    const [{ isNameVisible, isBirthdayVisible }, setVisibility] = useState({
        isNameVisible: false,
        isBirthdayVisible: false,
    });

    const loadAuthorName = () => setVisibility((prev) => ({ ...prev, isNameVisible: true }));
    const loadAuthorBirthday = () => setVisibility((prev) => ({ ...prev, isBirthdayVisible: true }));

    return (
        <main className="container mx-auto my-6 px-5">
            <div className="navbar bg-base-100 shadow-sm flex justify-between">
                <p className="btn btn-ghost text-xl">Apollo Cache Clobbering Repro</p>
                <a href="https://github.com/magicmark/apollo-cache-clobbering" className="mr-2 flex gap-2 items-center">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        fill="currentColor"
                        class="bi bi-github"
                        viewBox="0 0 16 16"
                    >
                        <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8" />
                    </svg>
                    <span className="text-sm font-mono link link-primary">magicmark/apollo-cache-clobbering</span>
                </a>
            </div>

            <div className="mt-4 text-accent-content flex flex-col gap-1">
                <p>
                    Our fake application below depends on these two queries. You can simulate loading these into the
                    page by clicking the buttons.
                </p>
                <p>
                    See the <span className="font-mono">client.readQuery()</span> section below to see the issue - the
                    cached result data of a query can be wiped away.
                </p>
                <p>
                    This breaks the performance optimization technique whereby we manually write to the cache in SSR
                    before <span className="font-mono">renderToString</span>, such that{' '}
                    <span className="font-mono">useQuery</span> returns a result instantly without a rerender.
                </p>
            </div>
            <div className="flex gap-4 w-full mt-4">
                <CodeCard query={BookWithAuthorName} load={loadAuthorName} />
                <CodeCard query={BookWithAuthorBirthdate} load={loadAuthorBirthday} />
                <ClearCacheState
                    resetVisibility={() => setVisibility({ isNameVisible: false, isBirthdayVisible: false })}
                />
            </div>

            <div className="mockup-window shadow-md bg-secondary-content border border-accent mt-6 w-full">
                <div className="mx-8 mb-6">
                    <h1 className="text-2xl font-bold">My Favorite Book Viewer Application</h1>
                    <p className="mt-2">My favorite book is "Fantastic Mr. Fox". Here are some details about it!</p>
                    <div className="flex gap-4 w-full mt-4">
                        <AuthorDetailCard
                            query={BookWithAuthorName}
                            getter={(data) => data.favoriteBook.author.name}
                            title="Author's Name"
                            isVisible={isNameVisible}
                        />
                        <AuthorDetailCard
                            query={BookWithAuthorBirthdate}
                            getter={(data) => data.favoriteBook.author.dateOfBirth}
                            title="Author's Birthday"
                            isVisible={isBirthdayVisible}
                        />
                    </div>
                </div>
            </div>
            <div className="divider">Normalized Cache View</div>
            <CacheState />

            <div className="divider">
                <span className="font-mono">cache.readQuery()</span>
            </div>
            <p className="mt-2">
                Here's the issue! You can only read <b>one</b> query cache value. Whichever query you clicked on first
                gets wiped away by the second.
            </p>
            <div className="flex gap-4 w-full mt-4">
                <ReadQueryCard query={BookWithAuthorName} />
                <ReadQueryCard query={BookWithAuthorBirthdate} />
            </div>
        </main>
    );
}

export default App;

window.gql = gql;
