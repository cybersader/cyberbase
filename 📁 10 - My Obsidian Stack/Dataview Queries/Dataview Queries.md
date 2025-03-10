---
aliases: 
tags: 
publish: true
permalink:
date created: Saturday, March 8th 2025, 9:33 pm
date modified: Saturday, March 8th 2025, 9:33 pm
---

```_dataview
TABLE rows.file.link AS Note FROM #workspaces
FLATTEN file.etags AS Tags
WHERE contains(Tags, "#workspaces") AND contains(Tags, "monitoring") AND !contains(Tags, "#archive")
GROUP BY Tags
```

```_dataview
TABLE rows.file.link AS Note FROM #workspaces
FLATTEN file.etags AS Tags
WHERE contains(Tags, "#workspaces") AND contains(Tags, "meeting") AND !contains(Tags, "#archive")
GROUP BY Tags
```

```_dataview
TABLE rows.file.link AS Note FROM #projects
FLATTEN file.etags AS Tags
WHERE contains(Tags, "#projects") AND !contains(Tags, "#archive") 
GROUP BY Tags
```

```_dataview
TABLE rows.file.link AS Note FROM #workspaces
FLATTEN file.etags AS Tags
WHERE contains(Tags, "#workspaces") AND !contains(Tags, "#archive")
GROUP BY Tags
```

```dataviewjs
// Get all pages in the specified path

let pages = dv.pages('#workspaces');

// Initialize a map to store notes by their nested tags

let tagMap = new Map();

// Loop through each page

for (let page of pages) {

    // Check if the page has tags

    if (page.tags) {

        // Get the tags associated with the page

        let tags = page.tags;

        // Loop through each tag

        for (let tag of tags) {

            // Split the tag by '/' and take the last segment (nested tag)

            let nestedTag = tag.includes('/') ? tag.split('/')
                .pop() : tag;

            // If the nested tag is not already in the map, add it with an empty array

            if (!tagMap.has(nestedTag)) {

                tagMap.set(nestedTag, []);

            }

            // Add the page link to the list of pages for this nested tag

            tagMap.get(nestedTag)
                .push(page.file.link);

        }

    }

}

// Loop through each nested tag in the map

for (let [nestedTag, pages] of tagMap) {

    // Create a header for the nested tag

    dv.header(3, nestedTag);

    // Display the list of pages under the nested tag

    dv.list(pages);

}
```

```_tasks
path includes {{query.file.path}}
not done
group by function task.tags.filter( (tag) => ! tag.includes("#tracker") )
limit groups to 10
show urgency
show tree
sort by function reverse task.urgency
limit 100
```

Show tasks completed on a certain day:
```
(tag regex matches /person_1|secops|tracker/i) OR (path includes {{query.file.path}}) 
done on ALT_D_ENTER_HERE
group by function task.tags.filter( (tag) => ! tag.includes("#tracker") )
limit groups to 10
show urgency
show tree
sort by function reverse task.urgency
limit 100
```

```_dataview
LIST FROM #workspaces/vendor_meetings 
SORT data DESCENDING
```