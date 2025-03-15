---
aliases: 
tags: 
publish: true
permalink:
date created: Saturday, March 15th 2025, 3:37 pm
date modified: Saturday, March 15th 2025, 3:37 pm
---

```_tasks
path includes {{query.file.path}}
not done
group by function task.tags.filter( (tag) => ! tag.includes("#tasks/BLAHH ") )
limit groups to 10
show urgency
show tree
sort by function reverse task.urgency
limit 100
```