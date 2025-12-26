import React, {useState, useMemo} from "react";
import {extensions} from "../lib/extensions";
import "../styles/extensions.css";

function getBannerUrl (banner) {
    if (!banner) return `https://dashblocks.github.io/extensions/static/images/unknown.svg`;
    if (banner.startsWith("http://") || banner.startsWith("https://")) return banner;
    return `https://dashblocks.github.io/extensions/static/images/${banner}`;
}

function getCodeUrl (code) {
    if (!code) return "#";
    if (code.startsWith("http://") || code.startsWith("https://")) return code;
    return `https://dashblocks.github.io/extensions/static/extensions/${code}`;
}

function getCreatorNode (creator) {
    if (typeof creator == "string") return creator;
    return (
        <a
            href={creator.link === "_scratch_"
                ? `https://scratch.mit.edu/users/${creator.name}`
                : creator.link === "_github_"
                    ? `https://github.com/${creator.name}`
                    : creator.link}
            target="_blank"
            rel="noreferrer"
            key={creator.name}
        >
            {creator.name}
        </a>
    );
}

export default function ExtensionsGallery () {
    const [query, setQuery] = useState("");

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        return extensions.filter((e) => {
            if (!q) return true;
            return (
                (e.name || "").toLowerCase().includes(q) ||
                (e.description || "").toLowerCase().includes(q) ||
                (e.creator || "").toString().toLowerCase().includes(q)
            );
        });
    }, [extensions, query]);

    return (
        <>
            <header className="ext-gallery-header">
                <h1>Dash Extensions Gallery</h1>
                <div className="ext-controls">
                    <input
                        className="ext-search"
                        placeholder="Search"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                    />
                </div>
            </header>

            <div className="ext-gallery-root">
                <main>
                    <div className="ext-grid">
                        {filtered.map((ext) => (
                            <div key={ext.id} className="ext-card">
                                <div className="ext-banner">
                                    <img
                                        src={getBannerUrl(ext.banner)}
                                    />
                                </div>
                                <div className="ext-body">
                                    <h2 className="ext-title">{ext.name}</h2>
                                    <p className="ext-description">{ext.description}</p>
                                    <p className="ext-meta">
                                        {Array.isArray(ext.creator)
                                            ? (
                                                <>
                                                    <b>Creators: </b>
                                                    {ext.creator.map((creator, i) => (
                                                        <React.Fragment key={i}>
                                                            {getCreatorNode(creator)}
                                                            {i !== ext.creator.length - 1 && (
                                                                ', '
                                                            )}
                                                        </React.Fragment>
                                                    ))}
                                                </>
                                            ) : (
                                                <>
                                                    <b>Creator: </b>
                                                    {getCreatorNode(ext.creator)}
                                                </>
                                            )
                                        }
                                    </p>
                                    <div className="ext-actions">
                                        <button
                                            className="ext-btn"
                                            onClick={() => {
                                                window.open("https://dashblocks.github.io/editor.html?extension=" + getCodeUrl(ext.code), "_blank");
                                            }}
                                        >
                                            Open Extension
                                        </button>
                                        <button
                                            className="ext-btn"
                                            onClick={() => {
                                                navigator.clipboard.writeText(getCodeUrl(ext.code));
                                                alert("Extension link copied to clipboard!");
                                            }}
                                        >
                                            Copy Link
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </main>
            </div>
        </>
    );
}
