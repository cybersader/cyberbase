```dataview
TABLE rows.file.link AS Note FROM #workspaces
FLATTEN file.etags AS Tags
WHERE contains(Tags, "#workspaces") AND contains(Tags, "monitoring") AND !contains(Tags, "#archive")
GROUP BY Tags
```


```dataview
TABLE rows.file.link AS Note FROM #workspaces
FLATTEN file.etags AS Tags
WHERE contains(Tags, "#workspaces") AND contains(Tags, "meeting") AND !contains(Tags, "#archive")
GROUP BY Tags
```

```dataview
TABLE rows.file.link AS Note FROM #projects
FLATTEN file.etags AS Tags
WHERE contains(Tags, "#projects") AND !contains(Tags, "#archive") 
GROUP BY Tags
```

```dataview
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
(tag regex matches /ben|brent|secops|tracker/i) OR (path includes {{query.file.path}}) 
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

# FAQ

## I accidentally deleted data

- Check the `.trash` folder in File Explorer at the root of the folder for the vault

- 


# Roadmap

## Roadmap Items Dataview Query

```tasks
((tag regex matches /roadmap/i) AND NOT (tag regex matches /PLACEHOLDR/i))
not done
group by function task.tags.filter( (tag) => ! tag.includes("#roadmap") )
limit groups to 10
show urgency
show tree
sort by function reverse task.urgency
limit 100
```

## Roadmaps

### Chronos Timeline

```dataviewjs
//////////////////////////////////////////////////////////////////////////////////////////
// 1. CONFIGURATION PULLED FROM FRONTMATTER OR INLINE FIELDS
//////////////////////////////////////////////////////////////////////////////////////////

const cfg = {
    // Basic timeline settings
    title: dv.current().roadmapTitle || "Roadmap",
    defaultLane: dv.current().roadmapDefaultLane || "General",

    // "breadcrumb" => append nested path (except 'period') to the item label
    // "full" => skip 'period' but incorporate the rest into the group name
    childLaneOption: dv.current().roadmapChildLaneOption || "breadcrumb",

    // Colors & Priority
    overdueSuffix: dv.current().roadmapOverdueSuffix || " overdue",
    overdueFlag: dv.current().roadmapOverdueFlag || "red",
    priorityColors: {
        Highest: "red",
        High: "orange",
        Medium: "blue",
        Low: "cyan",
        Lowest: "gray"
    },
    doneColor: "green", // color for done tasks
    cancelledColor: "red", // color for cancelled tasks

    // Subtasks -> description
    captureSubtasks: true,

    // Single-date => `*`
    singleDateChar: "*",

    // Single-date color defaults
    givePointsColor: dv.current().roadmapPointHasColor !== false,
    createdOnlyColor: "purple",
    startedOnlyColor: "green",
    dueOnlyColor: "red",

    // Link tasks to their notes
    linkTasks: dv.current().roadmapLinkTasks || false,

    // Quarter Markers
    showQuarters: dv.current().roadmapShowQuarters !== false,
    quarterPlacement: "top", // or "bottom" or "none"

    // Date Range for Chronos defaultView
    defaultViewStart: dv.current().roadmapStart || "",
    defaultViewEnd: dv.current().roadmapEnd || "",

    // Ordering in Chronos
    orderBy: dv.current().orderBy || "start",
};

//////////////////////////////////////////////////////////////////////////////////////////
// 2. HELPER FUNCTIONS
//////////////////////////////////////////////////////////////////////////////////////////

// Priority from emojis
const emojiPriorityMap = {
    "🔺": "Highest",
    "⏫": "High",
    "🔼": "High",
    "⏺️": "Medium",
    "🔽": "Low",
    "⏬": "Lowest"
};

function getPriorityFromText(text) {
    for (let e in emojiPriorityMap) {
        if (text.includes(e)) return emojiPriorityMap[e];
    }
    return "";
}

// Parse #roadmap markers
// e.g. #roadmap/one/period/two => lane="one", chain=["period","two"]
function parseRoadmapMarkers(txt) {
    const rx = /#roadmap(?:\/([\w-]+))?(?:\/([\w-]+))?(?:\/([\w-]+))?(?:\/([\w-]+))?/;
    let m = txt.match(rx);
    let rootLane = cfg.defaultLane;
    let rest = [];
    if (m) {
        if (m[1]) rootLane = m[1];
        for (let i = 2; i < m.length; i++) {
            if (m[i]) rest.push(m[i]);
        }
    }
    return {
        rootLane,
        rest
    };
}

// Function that extracts a sub-bullet list for a given task, if desired.
function gatherSubBullets(task) {
    if (!cfg.captureSubtasks || !task.subtasks) return "";
    // Let's build a bullet list of subtask lines
    // This can be refined to skip completed or do something else
    let arr = [];
    for (let s of task.subtasks) {
        // skip if done or not, your choice
        arr.push(s.text + ". ");
    }
    if (arr.length > 0) {
        return "" + arr.join(". ");
    }
    return "";
}

// Split "title - desc" into [title, desc]
function parseTitleDesc(str) {
    let idx = str.indexOf(" - ");
    if (idx < 0) return [str.trim(), ""];
    let t = str.slice(0, idx).trim();
    let d = str.slice(idx + 3).trim();
    return [t, d];
}

// Color from done/cancelled tasks
function getStatusColor(task) {
    if (task.status === "done") return `#${cfg.doneColor}`;
    if (task.status === "cancelled") return `#${cfg.cancelledColor}`;
    return "";
}

// Convert date object to Chronos-friendly YYYY-MM-DD
function toChronosDate(dObj) {
    return dObj.toString().split("T")[0];
}

/**
 * Build the final Chronos line from parameters
 * @param {string} lineChar  e.g. '-', '*', '@'
 * @param {string} dateSyntax e.g. '[2025-01-01~2025-02-01]' or '[2025-01-10]'
 * @param {string} colorPart e.g. '#red'
 * @param {string} lane e.g. '{someLane}'
 * @param {string} label e.g. 'Title | Desc'
 */
function makeChronosLine(lineChar, dateSyntax, colorPart, lane, label) {
    let segs = [];
    segs.push(`${lineChar} ${dateSyntax}`);
    if (colorPart) segs.push(colorPart);
    if (lane) segs.push(`{${lane}}`);
    segs.push(label);
    return segs.join(" ");
}

function collectAllFullLanes(tasks) {
  let dict = {};
  for (let t of tasks) {
    // parse
    const { rootLane, rest } = parseRoadmapMarkers(t.text);
    if (!rootLane) continue;

    // >>> Filter out 'period' from rest to avoid unwanted lanes like "root/period"
    let filteredRest = rest.filter(seg => seg !== "period");

    // build expansions from rootLane + filteredRest
    let expansions = [];
    let current = rootLane;
    expansions.push(current);

    for (let i = 0; i < filteredRest.length; i++) {
      current += "/" + filteredRest[i];
      expansions.push(current);
    }

    if (!dict[rootLane]) dict[rootLane] = new Set();
    expansions.forEach(e => dict[rootLane].add(e));
  }

  // convert sets to arrays
  for (let k in dict) {
    dict[k] = Array.from(dict[k]);
  }
  return dict;
}

//////////////////////////////////////////////////////////////////////////////////////////
// 3. MAIN CODE
//////////////////////////////////////////////////////////////////////////////////////////

let lines = [];

// 3.1. Query tasks that contain #roadmap
const tasks = dv.pages("").file.tasks
    .where(t => t.text.includes("#roadmap"));

// 3.1.1 Gather all sub-lanes for root => expansions
const allFullLanes = collectAllFullLanes(tasks);

for (let task of tasks) {
    // Potential date fields
    let created = task.created;
    let scheduled = task.scheduled;
    let start = task.start;
    let due = task.due;

    let cDate = created ? toChronosDate(created) : "";
    let sDate = start ? toChronosDate(start) : "";
    let dDate = due ? toChronosDate(due) : "";
    let schDate = scheduled ? toChronosDate(scheduled) : "";

    // Identify lane + chain
    let {
        rootLane,
        rest
    } = parseRoadmapMarkers(task.text);

    // Clean text for base title
    let cleaned = task.text
        .replace(/#[\w\/-]+/g, "")
        .replace(/[🚩🔺⏫⏺️🔽⏬➕🛫📅]/g, "")
        .replace(/\d{4}-\d{2}-\d{2}/g, "")
        .trim();
    let [title, desc] = parseTitleDesc(cleaned);

    // Subtasks
    if (cfg.captureSubtasks && task.subtasks) {
        let sb = gatherSubBullets(task);
        if (sb) desc += (desc ? "\n" + sb : sb);
    }

    // Linking
    if (cfg.linkTasks && task.link) {
        desc += desc ? `\n[[${task.link}]]` : `[[${task.link}]]`;
    }

    // Decide final lane name and title modifications based on childLaneOption
    // If rest has 'period' we might skip it from the lane or treat differently
    let isPeriodTask = false;
    let laneName = rootLane;

    // Check if the second element is 'period'
    // e.g. rest = ["period"] or ["period","someOther"...]
    // if rest[0] === 'period', we want a period for any range
    // and we skip 'period' from lane building
    if (rest.length > 0 && rest[0] === "period") {
        isPeriodTask = true;
        // So we skip rest[0] => 'period' from the group name
        rest.shift();
    }

    if (cfg.childLaneOption === "full" && rest.length > 0) {
        laneName = rootLane + "/" + rest.join("/");
    } else if (cfg.childLaneOption === "breadcrumb" && rest.length > 0) {
        // Append them to the title (except 'period' which we already shifted out)
        title += ` (${rest.join("/")})`;
    }

    // Priority & status color
    let prio = getPriorityFromText(task.text);
    let color = getStatusColor(task); // done/cancelled => override
    if (!color && prio && cfg.priorityColors[prio]) {
        color = `#${cfg.priorityColors[prio]}`;
    }

    // Overdue?
    let isOverdue = false;
    if (dDate && task.status === "pending") {
        isOverdue = new Date(dDate) < new Date();
    }
    if (isOverdue) {
        color = `#${cfg.overdueFlag}`;
        title += cfg.overdueSuffix;
    }

    // Determine leftSide & rightSide for a range
    let leftSide = "";
    let rightSide = "";
    // prefer start => left, else created or scheduled
    if (sDate) leftSide = sDate;
    else if (cDate) leftSide = cDate;
    else if (schDate) leftSide = schDate;

    if (dDate) rightSide = dDate;

    // Are we a range or a single date?
    let hasRange = (leftSide && rightSide && leftSide !== rightSide);

    let lineChar = "-";
    let dateSyntax = "";
	if (isPeriodTask && cfg.childLaneOption === "full") {
	    if (hasRange) {
	        // We have dateSyntax = `[leftSide~rightSide]`
	        // and isPeriodTask indicates #roadmap/.../period
	        dateSyntax = `[${leftSide}~${rightSide}]`;
	
	        if (isPeriodTask && cfg.childLaneOption === "full") {
			  // Instead of only building expansions from root+rest,
			  // we look up all known expansions for this root in `allFullLanes[rootLane]`.
			  // Then produce a line for each if we have a valid date range (hasRange).
			  if (hasRange) {
			    let sublanes = allFullLanes[rootLane] || [];
			    // We have a dateSyntax = `[${leftSide}~${rightSide}]`
			    let lbl = desc ? `${title} | ${desc}` : title;
			    sublanes.forEach(l => {
			      // For each sub-lane under rootLane, produce a period line
			      let line = makeChronosLine("@", `[${leftSide}~${rightSide}]`, color, l, lbl);
			      lines.push(line);
			    });
			    continue; // skip normal single-lane push
			  } 
			  else {
			    // It's a "period" marker, but only a single date => just do normal single-line approach
			    // e.g. * [someDate]
			    // or skip if you prefer
			  }
			}
	    } else {
	        // single date => point
	        let singleDate = leftSide || rightSide;
	        if (!singleDate) {
	            // no date => skip
	            continue;
	        }
	        lineChar = cfg.singleDateChar; // default '*'
	        dateSyntax = `[${singleDate}]`;
	
	        // If givePointsColor => color a single date
	        if (cfg.givePointsColor && !color) {
	            // only start => green, only due => red, only created/sched => purple
	            let usedCount = [sDate, dDate, cDate, schDate].filter(x => x).length;
	            if (usedCount === 1) {
	                // figure out which one
	                if (sDate) color = `#${cfg.startedOnlyColor}`;
	                else if (dDate) color = `#${cfg.dueOnlyColor}`;
	                else color = `#${cfg.createdOnlyColor}`; // cDate or schDate
	            }
	        }
	    }
	} else {
		// Normal single-lane approach
		let lineChar = isPeriodTask ? "@" : "-";
		
		if (hasRange) {
		  dateSyntax = `[${leftSide}~${rightSide}]`;
		
		  // If it's a period task:
		  if (isPeriodTask) {
		    // If FULL => replicate expansions for each sub-lane
		    if (cfg.childLaneOption === "full") {
		      let sublanes = allFullLanes[rootLane] || [];
		      let lbl = desc ? `${title} | ${desc}` : title;
		      sublanes.forEach(l => {
		        let line = makeChronosLine("@", dateSyntax, color, l, lbl);
		        lines.push(line);
		      });
		      continue; // skip single-lane
		    }
		    else {
		      // BREADCRUMB mode => single period line
		      lineChar = "@";
		    }
		  } else {
		    lineChar = "-";
		  }
		
		  let lbl = desc ? `${title} | ${desc}` : title;
		  let finalLine = makeChronosLine(lineChar, dateSyntax, color, laneName, lbl);
		  lines.push(finalLine);
		  continue;
		} else {
	        // single date => point
	        let singleDate = leftSide || rightSide;
	        if (!singleDate) {
	            // no date => skip
	            continue;
	        }
	        lineChar = cfg.singleDateChar; // default '*'
	        dateSyntax = `[${singleDate}]`;
	
	        // If givePointsColor => color a single date
	        if (cfg.givePointsColor && !color) {
	            // only start => green, only due => red, only created/sched => purple
	            let usedCount = [sDate, dDate, cDate, schDate].filter(x => x).length;
	            if (usedCount === 1) {
	                // figure out which one
	                if (sDate) color = `#${cfg.startedOnlyColor}`;
	                else if (dDate) color = `#${cfg.dueOnlyColor}`;
	                else color = `#${cfg.createdOnlyColor}`; // cDate or schDate
	            }
	        }
	    }
	}

    // Build final label
    let lbl = desc ? `${title} | ${desc}` : title;
    let finalLine = makeChronosLine(lineChar, dateSyntax, color, laneName, lbl);

    lines.push(finalLine);
}

// 3.2. Build the Chronos code block
let out = [];
out.push("```chronos");
// DefaultView
if (cfg.defaultViewStart && cfg.defaultViewEnd) {
    out.push(`> DEFAULTVIEW ${cfg.defaultViewStart}|${cfg.defaultViewEnd}`);
}
// ORDERBY
out.push(`> ORDERBY ${cfg.orderBy}`);

out.push(`# ${cfg.title}`);

// Insert Q1..Q4 if showQuarters
if (cfg.showQuarters && cfg.defaultViewStart && cfg.defaultViewEnd) {
    let sy = Number(moment(cfg.defaultViewStart).format("YYYY"));
    let ey = Number(moment(cfg.defaultViewEnd).format("YYYY"));
    if (sy === ey) {
        let q1 = moment(cfg.defaultViewStart).month(0).format("YYYY-MM-DD");
        let q2 = moment(cfg.defaultViewStart).month(2).endOf("month").format("YYYY-MM-DD");
        let q3 = moment(cfg.defaultViewStart).month(5).endOf("month").format("YYYY-MM-DD");
        let q4 = moment(cfg.defaultViewStart).month(8).endOf("month").format("YYYY-MM-DD");
        if (cfg.quarterPlacement === "top") {
            out.push(`= [${q1}] Q1`);
            out.push(`= [${q2}] Q2`);
            out.push(`= [${q3}] Q3`);
            out.push(`= [${q4}] Q4`);
        }
    }
}

for (let ln of lines) {
    out.push(ln);
}

out.push("```");

console.log(`${out.join("\n")}`)

dv.paragraph(out.join("\n"));
```

# Roadmap Guide

## Roadmap Settings

> [!info]- 1 ) General Roadmap Settings
> roadmapTitle:: "Roadmap"
> roadmapDateFormat:: "YYYY-MM-DD"
> roadmapDefaultLane:: "General"

> [!info]- 2 ) Mermaid-Chart Settings
> roadmapAxisFormat:: "%b"
> roadmapOverdueSuffix:: " overdue"
> roadmapOverdueFlag:: "crit"
> displayMode:: "compact"
> ganttStart:: "2025-01-01"
> ganttEnd:: "2025-12-31"
> showStart:: false            
> showDue:: false 
> showCreation:: false
> dateRangePattern:: "MM/DD" 
> showQuarters:: true
> topDivider:: "°"
> bottomDivider:: "•"
> topLevelCrit:: true
> childLaneOption:: "breadcrumb"
> %% "breadcrumb" (default) or "full" %%
> quarterDivider:: "[Q#]"

> [!info]- 3 ) Chronos Timeline Settings
> roadmapStart:: "2025-01-01"
> roadmapEnd:: "2025-12-31"
> roadmapLinkTasks:: false
> roadmapPointHasColor:: false
> roadmapShowQuarters:: true
> roadmapChildLaneOption:: "breadcrumb"
> %% "breadcrumb" (default) or "full" %%

## How-To

> [!info]- 1 ) Adding to the Roadmap
> - Create a task with the task shortcut.
> - Add a tag of \#roadmap to the task

> [!info]- 2 ) Controlling Colors
> - Colors are mainly based on priority color, but will fall back to the start, scheduled, created, or due date.
> - Change mermaid or chronos settings to see how it affects the colors

