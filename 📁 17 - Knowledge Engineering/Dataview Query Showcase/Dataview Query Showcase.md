---
aliases: []
tags: []
publish: true
permalink:
date created: Saturday, March 15th 2025, 3:33 pm
date modified: Saturday, March 15th 2025, 3:36 pm
---

# Map out Docs and SOPs under a Folder

```_dataviewjs
// Function to get tags from the parent folder note
function getFolderTags(folderPath) {
    try {
        const folderNote =3D app.metadataCache.getFileCache(app.vault.getAb=
stractFileByPath(folderPath + '/_note.md'));
        return folderNote ? folderNote.tags : [];
    } catch (error) {
        return [];
    }
}

// Get files via Obsidian API - filter by extension and path containing "SO=
P" or tags containing "cyberhaven" and "docs/sop"
const files =3D app.vault.getFiles().filter(file =3D> {
    const fileTags =3D app.metadataCache.getFileCache(file)?.tags || [];
    return
    (
                    (
                                    (file.extension =3D=3D 'docx' || file.e=
xtension =3D=3D 'pdf') &&
                                    (file.path.includes("SOP") && file.pare=
nt && file.parent.path)
                                )
                                ||
        (
                        fileTags.some(tag =3D> tag.tag =3D=3D=3D "tech/cybe=
rhaven") &&
                        fileTags.some(tag =3D> tag.tag =3D=3D=3D "docs/sop"=
) &&
                        file.extension =3D=3D 'md'
                                )
    );
});

// Function to create a nested structure
function createNestedStructure(files, startDepth) {
    const root =3D {};
    files.forEach(file =3D> {
        const parts =3D file.path.split('/').slice(startDepth);
        let current =3D root;
        parts.forEach((part, index) =3D> {
            if (!current[part]) {
                current[part] =3D index =3D=3D=3D parts.length - 1 ? file :=
 {};
            }
            current =3D current[part];
        });
    });
    return root;
}

// Function to render the nested structure
function renderNestedStructure(structure, parentPath =3D '') {
    for (const key in structure) {
        if (structure[key].path) {
            const folderTags =3D getFolderTags(parentPath);
            const isDocument =3D structure[key].extension =3D=3D=3D 'docx' =
|| structure[key].extension =3D=3D=3D 'pdf';
            dv.table(
                ["Type", "Document Name", "Path", "Folder Tags"],
                [[isDocument ? "Document" : "Note", dv.fileLink(structure[k=
ey].path), structure[key].path, folderTags.join(", ")]]
            );
        } else {
            dv.header(3, key);
            renderNestedStructure(structure[key], parentPath + '/' + key);
        }
    }
}

// Define the depth to start at (e.g., 2 for starting at the second level)
const startDepth =3D 0;

// Create the nested structure and render it
const nestedStructure =3D createNestedStructure(files, startDepth);
renderNestedStructure(nestedStructure);
```

# Misc

```_dataviewjs
let query_1 =3D "#docs/sop and #tech/cyberhaven"
let query_2 =3D "#docs/sop/cyberhaven"

// Function to get tags from the parent folder note
function getFolderTags(folderPath) {
    try {
        const folderNote =3D app.metadataCache.getFileCache(app.vault.getAb=
stractFileByPath(folderPath + '/_note.md'));
        return folderNote ? folderNote.tags : [];
    } catch (error) {
        return [];
    }
}

// Get files via Obsidian API - filter by extension and path containing "SO=
P"
const files =3D app.vault.getFiles().filter(file =3D> {
    return (file.extension =3D=3D 'docx' || file.extension =3D=3D 'pdf') &&=
 file.path.includes("SOP") && file.parent && file.parent.path;
});

// Create table-like data structure for documents
const documents =3D files.map(file =3D> {
    const folderTags =3D getFolderTags(file.parent.path);
    return {
        type: "Document",
        name: dv.fileLink(file.path),
        path: file.path,
        tags: folderTags.join(", ")
    };
});

// Get note type pages with tags from query_1
const notes_1 =3D dv.pages(query_1).map(note =3D> {
    return {
        type: "Note",
        name: dv.fileLink(note.file.path),
        path: note.file.path,
        tags: note.file.tags ? note.file.tags.join(", ") : ""
    };
});

// Get note type pages with tags from query_2
const notes_2 =3D dv.pages(query_2).map(note =3D> {
    return {
        type: "Note",
        name: dv.fileLink(note.file.path),
        path: note.file.path,
        tags: note.file.tags ? note.file.tags.join(", ") : ""
    };
});

// Combine documents and notes
let combinedData =3D documents.concat(notes_1);
combinedData =3D documents.concat(notes_2);

// Sort combined data by paths
const sortedData =3D combinedData.sort((a, b) =3D> a.path > b.path ? 1 : -1=
);

// Display the sorted data in a table
dv.table(["Type", "Document Name", "Path", "Tags"], sortedData.map(item =3D=
> [item.type, item.name, item.path, item.tags]));
```

```_dataviewjs
let query_1 =3D "#docs/sop and #tech/cyberhaven"
let query_2 =3D "#docs/sop/cyberhaven"

// Function to get tags from the parent folder note
function getFolderTags(folderPath) {
    try {
        const folderNote =3D app.metadataCache.getFileCache(app.vault.getAb=
stractFileByPath(folderPath + '/_note.md'));
        return folderNote ? folderNote.tags : [];
    } catch (error) {
        return [];
    }
}

// Get files via Obsidian API - filter by extension and path containing "SO=
P"
const files =3D app.vault.getFiles().filter(file =3D> {
    return (file.extension =3D=3D 'docx' || file.extension =3D=3D 'pdf') &&=
 file.path.includes("SOP") && file.parent && file.parent.path;
});

// Create table-like data structure for documents
const documents =3D files.map(file =3D> {
    const folderTags =3D getFolderTags(file.parent.path);
    return {
        type: "Document",
        name: dv.fileLink(file.path),
        path: file.path,
        tags: folderTags.join(", ")
    };
});

// Get note type pages with tags from query_1
const notes_1 =3D dv.pages(query_1).map(note =3D> {
    return {
        type: "Note",
        name: dv.fileLink(note.file.path),
        path: note.file.path,
        tags: note.file.tags ? note.file.tags.join(", ") : ""
    };
});

// Get note type pages with tags from query_2
const notes_2 =3D dv.pages(query_2).map(note =3D> {
    return {
        type: "Note",
        name: dv.fileLink(note.file.path),
        path: note.file.path,
        tags: note.file.tags ? note.file.tags.join(", ") : ""
    };
});

// Combine documents and notes
let combinedData =3D documents.concat(notes_1);
combinedData =3D documents.concat(notes_2);

// Sort combined data by paths
const sortedData =3D combinedData.sort((a, b) =3D> a.path > b.path ? 1 : -1=
);

// Display the sorted data in a table
dv.table(["Type", "Document Name", "Path", "Tags"], sortedData.map(item =3D=
> [item.type, item.name, item.path, item.tags]));
```


```_dataviewjs

// Function to test regex on tags
function regextest(tags, pattern) {
    return tags.some(tag => new RegExp(pattern).test(tag));
}
 

// Get files via Obsidian API - filter by extension and folder note tags
const files = app.vault.getFiles().filter(file => {
    const folderNote = app.metadataCache.getFileCache(app.vault.getAbstractFileByPath(file.parent.path + '/_note.md'));
    const folderTags = folderNote ? folderNote.tags : [];
    return (file.extension == 'docx' || file.extension == 'pdf') && regextest(folderTags, "SOP");
});

// Creating a list with links
dv.list(files.map(f => dv.fileLink(f.path)));

```

```_dataviewjs

// get files via Obsidian api - filter pdf extension and path with the string "Preparation"
const files = app.vault.getFiles().filter(file => ((file.extension == 'docx' || file.extension == 'pdf') && file.path.includes("SOP")));

// creating a list with links
dv.list(files.map(f => dv.fileLink(f.path)))

dv.sort

```