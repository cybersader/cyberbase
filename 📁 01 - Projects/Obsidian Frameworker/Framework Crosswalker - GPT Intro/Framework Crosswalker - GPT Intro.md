---
aliases: []
tags: []
publish: true
permalink:
date created: Monday, April 21st 2025, 8:52 am
date modified: Monday, April 21st 2025, 8:58 am
---

I'm trying to make a program that can take the tabular representations or components of cybersecurity frameworks, connect them, and then translate them into a hierarchy of folders and notes with links and YAML that help show relationships between these frameworks and their components.

I've got a Python program that I've finished building a good bit of (mostly just the ingestion or consuming of the framework data).  

I want to have all of the code worked out to where it's obvious what the structure of the program does and how it works.  I want the vocabulary and the flow to take a first principles approach in terms of the structuring of the cybersecurity ontologies and how the information is translated.  The code and process should be useful because it takes a fundamental approach to cybersecurity frameworks and their relationships.

Below is some of the old code, old notes, and old conversations with LLM.  Let's start by trying to finish up the old code.

---

Now we are onto the hard part.  I need to extend my existing python program to allow me to define these mappings and automatically translate that data into taxonomical structures of folders and files like I've done with CRI.  

I want this to be a relatively modular framework and not just everything hardcoded into the program.  I want to be able to define the mappings to automatically create relative markdown links along with being able to control how some of the data is translated into YAML frontmatter.  

You can see examples of how some of this is done is my current code below.  However, I want to fundamentally attack this translation layer from csv files to creating taxonomical folder file structures that work well with tools like Obsidian.

Notice also that there are several key issues that arise in coding this.  For instance, you can often have column names that don't quite match up.  If there were a GUI based tool to hook into Python scripts like this, that would be cool, but for now, we will just have to stick with defining some JSON config or something in the code to fill out the files.  Luckily, path intellisense in VS code is useful for this.  

With this framework, we aren't left joining all of the overlapping tables/frameworks.  Instead, we generate taxonomical structures for them based on some naming scheme type regex variables or some other options for choosing the structuring.  Usually, a column will have this information as some sort of "path" like "l1/l2/l3/l4", but we can also use combinations of columns to define this hierarchy too with something like an array of the column names in descending order.  This is the part that generates the structure, but then we have to decide how the data is translated into the markdown files.  The simplest option for this is to translate everything into YAML frontmatter tags.  For the data columns, this can be done.  We can also translate them into headings as another good options.  Some data like the CRI tags with the array/list type value in that one column can be renamed to a "tags" column as one example.  This would be an example of custom remapping rather than using the same column-name as a frontmatter field.  Notice too that frontmatter fields need a certain format to work.  

Lastly, on this subject, we have the linking between frameworks as relative links.  Where to put this data is actually quite crucial.  When we go to analyze these connections in Obsidian, we will be looking for ways to query these relationships.  We may store lists of relative links in some markdown heading at the top with a hierarchical structure for each page, or we may instead somehow store the relative links in YAML which I'm not sure is an option.  

For all of this, I want options to try out each and not just commit to one thing.


For the linking between frameworks part of this, I think I would rather have the linking part with it's own configuration object.  The interesting about this is that, sometimes, I want to directly linking between pages of a framework.  Sometimes, I have a mapping table, which is one of these "frameworks" that is processes and then attaches between frameworks.  For now, I want to link frameworks together with some framework linking object where I define framework_name frameworks that are related, in which I give the columns to match on.  One caveat to this is that some columns are array columns which need to be processed to match values, some may need to use regex to match, etc.  Let's figure out a good way to go about this.  
 I also have some custom cleaning functions that had to be used in the old code to get CRI working.  I need a way to do this too.  If need be, I could do the loading of the files with manual lines and instead use the variables names to link to the configuration object (not the linking one)

There's two issues right now and several others that I won't mention yet:
1. The tags aren't being included for CRI.  I need to be able to aggregate them from one of the tables (like in the below older code) and include them in the same way.
2. I need to be able to say use .nan (or a better value for missing) when the value doesn't appear for that case.  Right now it uses .nan, but the old code just seems to have left it our entirely if the value was empty.

I want to be able to mess with the df data for tables like I did with the below old code.  If need be, extend one of those prepping sections to make it obvious where that type of stuff can go.

In fact, the main loop that uses the configuration parts is essentially the markdown file and folder creation along with the linking, but not necessarily the creation of the tables used to make those.  That part can come before with all of this other stuff.

Some of these will include merging of dfs before going into the main functions just FYI.

```python
#%%
import os
import re
import yaml
import pandas as pd
import warnings
import numpy as np
from tqdm import tqdm
import sys

###############################################################################
# HELPER FUNCTIONS
###############################################################################

# Create a helper function to print DataFrame information
def print_df_info(name, df, num_rows=5):
    print(f"\n=== {name} ===")
    print(f"Shape: {df.shape}")
    print("Columns:")
    print(list(df.columns))
    print("\nSample Data:")
    print(df.head(num_rows))
    print("=" * 40)
    sys.stdout.flush()  # Force the output to flush

def match_value(val_s, val_t, mode="exact"):
    """
    Compare val_s vs. val_t using:
      - exact: string equality
      - array-contains: checks if val_s in a split of val_t
      - regex: val_s as a pattern in val_t
    """
    if pd.isna(val_s) or pd.isna(val_t):
        return False
    s, t = str(val_s).strip(), str(val_t).strip()

    if mode == "exact":
        return s == t
    elif mode == "array-contains":
        tokens = re.split(r'[,\s]+', t)
        return s in tokens
    elif mode == "regex":
        return re.search(s, t) is not None
    return False

def build_full_path_components(code: str):  # TODO - refactor to account for different taxonomy IDs/code syntaxes (allow regex input?)
    """'ID.AM-1' -> ['ID','ID.AM','ID.AM-1'] (cumulative approach)."""
    spots = [m.start() for m in re.finditer(r'[.-]', code)]
    parts = []
    for s in spots:
        parts.append(code[:s])
    parts.append(code)
    return parts

def split_folders(code: str):  # TODO - account for case of wanting to split names as they go down in the hiearchy instead
    """'ID.AM-1' -> ['ID','AM','1'] (split approach)."""
    return re.split(r'[.-]', code)

def sanitize_column_name(col: str) -> str:
    """
    Turn 'Profile Id' => 'profile_id',
    'Category / Subcategory' => 'category_subcategory', etc.
    """
    name = col.strip().lower()
    name = re.sub(r'[\s/]+', '_', name)
    name = re.sub(r'[^\w_-]', '', name)
    return name

# TODO - more helper functions

###############################################################################
# CORE FUNCTIONS - TAXONOMY BUILDER AND LINKER
###############################################################################

# Node linker together
    '''
    Input:
        - Linking configs - tells of how taxonomies relate to each other in terms of overlap
        - 
    Run:
        -
    Output:
        - 
    '''

# Taxonomy builder
    '''
    Input:
        - Dataframes for each table/taxonomy
        - Framework configs
            - Map columns and values to either YAML frontmatter or headings
    Run:
        - Modifies folders and markdown files along with YAML
    '''

def hierarchical_ffill(df, columns):
    """
    Perform a hierarchical forward fill on a list of columns in order.
    
    Parameters
    ----------
    df : pd.DataFrame
        The dataframe containing hierarchical columns.
    columns : list of str
        Ordered column names from highest (leftmost) to lowest (rightmost).
        
    Returns
    -------
    pd.DataFrame
        The same dataframe with hierarchical columns forward-filled.
    """
    # Make sure blanks ("") are recognized as NaN
    df = df.replace("", np.nan)
    
    # 1) Forward-fill the top (first) column across the entire dataframe
    df[columns[0]] = df[columns[0]].ffill()

    # 2) Forward-fill each subsequent column, but group by the previously filled columns
    for i in range(1, len(columns)):
        parent_cols = columns[:i]  # columns that define the current "group" context
        df[columns[i]] = (
            df.groupby(parent_cols, dropna=False)[columns[i]]
              .ffill()
        )

    return df

# TODO - the hard part here

###############################################################################
# MAIN CODE
###############################################################################

if __name__ == "__main__":

    # used for progress bars - combined tqdm with pandas
    tqdm.pandas()

    # Suppress openpyxl warnings for header/footer and unsupported extensions
    warnings.filterwarnings("ignore", category=UserWarning, module="openpyxl")

    ###############################################################################
    # FRAMEWORK SPREADSHEETS PARSING & PREP
    ###############################################################################

    # USE Ctrl-f "file_mapping" to find all the cases of mapping between frameworks

    # Load your Excel files, specifying the sheet you want
    # We'll store them in 'dfs' with keys referencing each sheet's DataFrame
    # TODO - include data source URLs
    file_cri = "./Frameworks/Final-CRI-Profile-v2.0-Public-CRI.xlsx"
    file_cri_extra_columns = "./Frameworks/Final-CRI-Profile-v2.0-Public.-Date-2024.02.29-2.xlsx"
    file_financial_mapping_custom_1 = "./Frameworks/Jonathans_Framework Mapping.xlsx"

    file_nist_controls = "./Frameworks/sp800-53r5-control-catalog.xlsx"
    file_nist_assessment = "./Frameworks/sp800-53ar5-assessment-procedures.xlsx"
    file_mapping_nist_to_mitre = "./Frameworks/nist_800_53-rev5_attack-14.1-enterprise.xlsx"

    file_mitre_engage = "./Frameworks/Engage-Data-V1.0.xlsx"

    file_mitre_defend = "./Frameworks/d3fend.csv"
    file_mitre_defend_full = "./Frameworks/d3fend-full-mappings.csv"
    file_mapping_defend_to_nist_controls = "./Frameworks/d3fend_to_nist80053.csv"

    file_mitre_attack = "./Frameworks/enterprise-attack-v16.1.xlsx"
    file_mapping_mitre_attack_to_defend = "./Frameworks/att&ck_to_d3fend.csv"
    file_mapping_nist_attack_to_csf2 = "./Frameworks/NISTCSF_MITRE.csv"

    file_csf2_core = "./Frameworks/csf2.xlsx"
    file_mapping_csf2_to_nist_controls = "./Frameworks/Cybersecurity_Framework_v2-0_Concept_Crosswalk_800-53_final.xlsx"

    file_cis_controls = "./Frameworks/CIS_Controls_Version_8.1_6_24_2024.xlsx"
    file_mapping_cis_controls_to_csf2 = "./Frameworks/CIS_Controls_v8_Mapping_to_NIST_CSF_2_2023.xlsx"


    # ----------------------------------------------------------------------
    # 1) CRI
    # ----------------------------------------------------------------------

    # CORE FRAMEWORK DATA (below)
    df_cri_structure = pd.read_excel(file_cri, sheet_name="CRI Profile v2.0 Structure", header=2)
    df_cri_diag_tags = pd.read_excel(file_cri, sheet_name="Diagnostic Statements by Tag", header=3)
    # MAPPINGS/CROSSWALKS (below)
    df_cri_nist_mapping = pd.read_excel(file_cri, sheet_name="NIST CSF v2 Mapping", header=3)
    df_cri_ffiec_cat = pd.read_excel(file_cri, sheet_name="FFIEC CAT to Profile Mapping", header=3)
    df_cri_ffiec_aio = pd.read_excel(file_cri, sheet_name="FFIEC AIO Mapping", header=3)
    df_cri_ffiec_bcm = pd.read_excel(file_cri, sheet_name="FFIEC BCM Mapping", header=3)
    df_cri_cisa = pd.read_excel(file_cri, sheet_name="CISA CPG 1.0.1 Mapping", header=3)
    df_cri_ransomware = pd.read_excel(file_cri, sheet_name="NIST Ransomware Profile", header=3)

    for col in df_cri_structure.select_dtypes(include=['object']).columns:
        df_cri_structure[col] = df_cri_structure[col].str.strip()
    for col in df_cri_diag_tags.select_dtypes(include=['object']).columns:
        df_cri_diag_tags[col] = df_cri_diag_tags[col].str.strip()

    df_cri_structure.columns = df_cri_structure.columns.str.replace('  ', ' ')
    df_cri_structure.columns = [re.sub(r'\s\s', ' ', col) for col in df_cri_structure.columns]
    df_cri_structure.columns = [re.sub(r'\n', ' ', col) for col in df_cri_structure.columns]
    df_cri_diag_tags.columns = df_cri_diag_tags.columns.str.replace('  ', ' ')
    df_cri_diag_tags.columns = [re.sub(r'\s\s', ' ', col) for col in df_cri_diag_tags.columns]
    df_cri_diag_tags.columns = [re.sub(r'\n', ' ', col) for col in df_cri_diag_tags.columns]

    df_cri_diag_tags = df_cri_diag_tags.dropna(subset=['Profile Id'])

    def add_cri_to_tags(tags):
        return re.sub(r'#(\w+)', r'#cri/\1', tags)
    
    tags_column = 'CRI Profile Subject Tags'
    # Here, we use an explicit tqdm progress bar with its own description.
    df_cri_diag_tags[tags_column] = [
        add_cri_to_tags(tag)
        for tag in tqdm(df_cri_diag_tags[tags_column],
                        desc="[+] Processing CRI Profile Subject Tags",
                        unit="tag")
    ]
    # Force writing an empty line to complete the progress bar output
    tqdm.write("")

    df_cri_tags_agg = (
        df_cri_diag_tags
        .groupby('Profile Id')['CRI Profile Subject Tags']
        .agg(lambda x: ' '.join(sorted(set(' '.join(x.dropna()).split()))))
        .reset_index()
    )

    df_cri_core = pd.merge(
        df_cri_structure,
        df_cri_tags_agg,
        how='left',
        left_on='Profile Id',   # from sheet 1
        right_on='Profile Id',   # aggregated df_tags_agg
        suffixes=('', '_remove')
    )

    # remove the duplicate columns
    df_cri_core.drop([i for i in df_cri_core.columns if 'remove' in i],
                axis=1, inplace=True)

    # TESTING - Print out information for each DataFrame
    # print_df_info("CRI Profile v2.0 Structure", df_cri_structure)
    # print_df_info("Diagnostic Statements by Tag", df_cri_diag_tags)
    # print_df_info("CRI NIST CSF Mapping", df_cri_nist_mapping)
    # # print_df_info("FFIEC CAT to Profile Mapping", df_cri_ffiec_cat)
    # # print_df_info("FFIEC AIO Mapping", df_cri_ffiec_aio)
    # # print_df_info("FFIEC BCM Mapping", df_cri_ffiec_bcm)
    # # print_df_info("CISA CPG 1.0.1 Mapping", df_cri_cisa)
    # # print_df_info("NIST Ransomware Profile", df_cri_ransomware)
    # print_df_info("Merged CRI Core Data", df_cri_core)

    # TODO - define mapping and linking configs

    # ----------------------------------------------------------------------
    # 2) NIST CONTROLS & ASSESSMENT
    # ----------------------------------------------------------------------

    # CORE FRAMEWORK DATA (below)
    df_nist_controls = pd.read_excel(file_nist_controls)
    df_nist_assessment = pd.read_excel(file_nist_assessment, sheet_name="SP.800-53Ar5_assessment_procedu")
    # MAPPINGS/CROSSWALKS (below)
    df_nist_to_attack = pd.read_excel(file_mapping_nist_to_mitre)

    # The idea is to transform messy assessment identifiers like "AC-01_ODP[01]"
    # into a simpler form ("AC-1") that will match the controls data.
    # The regex pattern below captures a letter prefix, a hyphen, and then one or more digits
    # while removing any extra content after the digits.
    #
    # Pattern explanation:
    #   ^               : start of string
    #   ([A-Za-z]+)     : one or more letters (the prefix)
    #   -               : a hyphen
    #   0?(\d+)        : an optional leading zero followed by one or more digits
    #
    # If a match is found, we reassemble the key as "prefix-numeric" where the numeric part
    # is converted to an integer (thus removing any leading zeros). Otherwise, we leave the value as is.
    pattern = r'^([A-Za-z]+)-0?(\d+)'

    tqdm.pandas(desc="[+] Normalizing assessment identifiers")
    
    df_nist_assessment["merge_key"] = df_nist_assessment["identifier"].progress_apply(
        lambda s: (
            f"{re.match(pattern, str(s)).group(1)}-{int(re.match(pattern, str(s)).group(2))}"
            if re.match(pattern, str(s)) else str(s)
        )
    )

    # Here we assume that the controls table's "Control_Identifier" column already follows
    # the format we want (e.g. "AC-1", "AC-2", "AC-2(1)", etc.). If you need additional cleaning
    # for controls keys, you can apply a similar inline lambda.
    df_nist_controls["merge_key"] = df_nist_controls["Control Identifier"]

    tqdm.pandas(desc="[+] Merging NIST core and assessments")

    df_nist_core = pd.merge(
        df_nist_controls,
        df_nist_assessment,
        on="merge_key",
        how="left",
        suffixes=("_ctrl", "_assess")
    ).progress_apply(lambda x: x)

    df_nist_core.drop(["merge_key"], axis=1, inplace=True)

    # # TESTING - Print out information for each DataFrame
    # print_df_info("NIST 800-53 Controls", df_nist_controls)
    # print_df_info("NIST 800-53 Assessment", df_nist_assessment)
    # print_df_info("NIST 800-53 Core", df_nist_core)
    # print_df_info("NIST to Mitre ATT&CK", df_nist_to_attack)

    # TODO - define mapping and linking configs

    # ----------------------------------------------------------------------
    # 3) MITRE ATT&CK
    # ----------------------------------------------------------------------

    # CORE FRAMEWORK DATA (below)
    df_mitre_attack = pd.read_excel(file_mitre_attack, sheet_name="techniques")
    # MAPPINGS/CROSSWALKS (below)
    df_mitre_attack_to_defend = pd.read_csv(file_mapping_mitre_attack_to_defend)
    df_mitre_attack_to_csf2 = pd.read_csv(file_mapping_nist_attack_to_csf2)

    # TESTING - Print out information for each DataFrame
    # print_df_info("Mitre ATT&CK Core", df_mitre_attack)
    # print_df_info("Mitre ATT&CK to D3FEND", df_mitre_attack_to_defend)
    # print_df_info("Mitre ATT&CK to NIST CSFv2", df_mitre_attack_to_csf2)

    # TODO - define mapping and linking configs

    # ----------------------------------------------------------------------
    # 4) MITRE ENGAGE
    # ----------------------------------------------------------------------

    # CORE FRAMEWORK DATA (below)
    df_mitre_engage_activities = pd.read_excel(file_mitre_engage, sheet_name="Activities")
    df_mitre_engage_approaches = pd.read_excel(file_mitre_engage, sheet_name="Approaches")
    df_mitre_engage_goals = pd.read_excel(file_mitre_engage, sheet_name="Goals")
    df_mitre_engage_vulns = pd.read_excel(file_mitre_engage, sheet_name="Vulnerabilities")
    df_mitre_engage_goal_to_approach = pd.read_excel(file_mitre_engage, sheet_name="Goal Approach Mappings")
    df_mitre_engage_approach_to_activity = pd.read_excel(file_mitre_engage, sheet_name="Approach Activity Mappings")
    # MAPPINGS/CROSSWALKS (below)
    df_mitre_engage_to_attack = pd.read_excel(file_mitre_engage, sheet_name="Enterprise ATT&CK Mappings")
    
    tqdm.pandas(desc="[+] Merging Mitre ENGAGE Core")

    # Merge goals with "goal to approach"
    df_engage_goals_merged = pd.merge(
        df_mitre_engage_goals,
        df_mitre_engage_goal_to_approach,
        how="left",
        left_on="ID",
        right_on="goal_id",
        suffixes=("", "_remove")
    ).progress_apply(lambda x: x)

    # remove the duplicate columns
    df_engage_goals_merged.drop([i for i in df_engage_goals_merged.columns if '_remove' in i],
                axis=1, inplace=True)

    # Then merge in the approaches
    df_engage_goals_with_approaches = pd.merge(
        df_engage_goals_merged,
        df_mitre_engage_approaches,
        how="left",
        left_on="approach_id",
        right_on="ID",
        suffixes=("", "_remove")
    ).progress_apply(lambda x: x)

    # remove the duplicate columns
    df_engage_goals_with_approaches.drop([i for i in df_engage_goals_with_approaches.columns if '_remove' in i],
                axis=1, inplace=True)

    # Then if you want to see the activities for each approach:
    df_engage_approach_with_activities = pd.merge(
        df_mitre_engage_approaches,
        df_mitre_engage_approach_to_activity,
        how="left",
        left_on="ID",
        right_on="approach_id",
        suffixes=("","_remove")
    ).progress_apply(lambda x: x)

    # remove the duplicate columns
    df_engage_approach_with_activities.drop([i for i in df_engage_approach_with_activities.columns if '_remove' in i],
                axis=1, inplace=True)

    df_engage_approach_with_activities = pd.merge(
        df_engage_approach_with_activities,
        df_mitre_engage_activities,
        how="left",
        left_on="activity_id",
        right_on="ID",
        suffixes=("", "_remove")
    ).progress_apply(lambda x: x)

    # remove the duplicate columns
    df_engage_approach_with_activities.drop([i for i in df_engage_approach_with_activities.columns if '_remove' in i],
                axis=1, inplace=True)

    df_engage_core = pd.merge(
        df_engage_goals_with_approaches,
        df_engage_approach_with_activities,
        how="left",
        left_on="approach_id",
        right_on="approach_id",
        suffixes=("", "_remove")
    )

    # remove the duplicate columns
    df_engage_core.drop([i for i in df_engage_core.columns if 'remove' in i],
                axis=1, inplace=True)

    # TESTING - Print out information for each DataFrame
    # print_df_info("Mitre ENGAGE Activities", df_mitre_engage_activities)
    # print_df_info("Mitre ENGAGE Approaches", df_mitre_engage_approaches)
    # print_df_info("Mitre ENGAGE Goals", df_mitre_engage_goals)
    # print_df_info("Mitre ENGAGE Vulnerabilities", df_mitre_engage_vulns)
    # print_df_info("Mitre ENGAGE Goal to Approach", df_mitre_engage_goal_to_approach)
    # print_df_info("Mitre ENGAGE Approach to Activity", df_mitre_engage_approach_to_activity)
    # print_df_info("Mitre ENGAGE Goals -> Approaches", df_engage_goals_with_approaches)
    # print_df_info("Mitre ENGAGE Approach -> Activities", df_engage_approach_with_activities)
    # print_df_info("Mitre ENGAGE Core", df_engage_core)

    # TODO - define mapping and linking configs

    # ----------------------------------------------------------------------
    # 5) MITRE D3FEND
    # ----------------------------------------------------------------------

    # CORE FRAMEWORK DATA (below)
    df_defend = pd.read_csv(file_mitre_defend)
    df_defend_full_mapping = pd.read_csv(file_mitre_defend_full)
    # MAPPINGS/CROSSWALKS (below)
    df_defend_to_nist_controls = pd.read_csv(file_mapping_defend_to_nist_controls)

    def get_lowest_tech_label(row):
        """
        Return D3FEND Technique Level 1 if available,
        else D3FEND Technique Level 0, else D3FEND Technique.
        """
        lvl1 = row['D3FEND Technique Level 1']
        lvl0 = row['D3FEND Technique Level 0']
        base = row['D3FEND Technique']

        if pd.notna(lvl1) and str(lvl1).strip():
            return str(lvl1).strip()
        elif pd.notna(lvl0) and str(lvl0).strip():
            return str(lvl0).strip()
        elif pd.notna(base) and str(base).strip():
            return str(base).strip()
        else:
            return None  # No technique at all

    tqdm.pandas(desc="[+] Merging Mitre D3FEND Core")
    df_defend['lowest_tech_label'] = df_defend.progress_apply(get_lowest_tech_label, axis=1)

    # Define columns to fill in the hierarchical order
    hier_cols = [
        "D3FEND Technique",
        "D3FEND Technique Level 0",
        "D3FEND Technique Level 1",
    ]

    df_defend = hierarchical_ffill(df_defend, hier_cols)

    # TODO - use this once granular deeper data has been accounted for in the code
    # df_defend_full_mapping["def_tech_label"] = df_defend_full_mapping["def_tech_label"].astype(str)

    # df_d3fend_core = pd.merge(
    #     df_defend_full_mapping,
    #     df_defend,
    #     how="left",
    #     left_on="def_tech_label",
    #     right_on="lowest_tech_label",
    #     suffixes=("", "_remove")
    # ).progress_apply(lambda x: x)

    # # remove the duplicate columns
    # df_d3fend_core.drop([i for i in df_engage_goals_with_approaches.columns if '_remove' in i],
    #             axis=1, inplace=True)

    # TESTING - Print out information for each DataFrame
    # print_df_info("Mitre D3FEND", df_defend)
    # print_df_info("Mitre D3FEND Full Data", df_defend_full_mapping)
    # print_df_info("Mitre D3FEND Core", df_d3fend_core)
    # print_df_info("Mitre D3FEND to NIST 800-53 Controls", df_defend_to_nist_controls)

    # TODO - define mapping and linking configs

    # ----------------------------------------------------------------------
    # 6) NIST CSF v2
    # ----------------------------------------------------------------------

    df_csf2 = pd.read_excel(file_csf2_core, sheet_name="CSF 2.0", header=1)
    # MAPPINGS/CROSSWALKS (below)
    df_csf2_to_nist_controls = pd.read_excel(file_mapping_csf2_to_nist_controls)

    # TESTING - Print out information for each DataFrame
    # print_df_info("NIST CSFv2 Core", df_csf2)
    # print_df_info("NIST CSFv2 to NIST 800-53 Controls", df_csf2_to_nist_controls)

    # TODO - define mapping and linking configs

    # ----------------------------------------------------------------------
    # 7) CIS CONTROLS v8
    # ----------------------------------------------------------------------

    # CORE FRAMEWORK DATA (below)
    df_cis_controls = pd.read_excel(file_cis_controls, sheet_name="Controls V8")
    # MAPPINGS/CROSSWALKS (below)
    df_cis_controls_to_csf2 = pd.read_excel(file_mapping_cis_controls_to_csf2, sheet_name="All CIS Controls & Safeguards", 
                                            header=0)
    df_cis_controls_to_csf2.drop(columns=['Unnamed: 0'], inplace=True)
    df_cis_controls_to_csf2_unmapped_CSF = pd.read_excel(file_mapping_cis_controls_to_csf2, sheet_name="Unmapped CSF")
    df_cis_controls_to_csf2_unmapped_CIS = pd.read_excel(file_mapping_cis_controls_to_csf2, sheet_name="Unmapped CIS")

    # Set up new columns for storing preamble (control) info.
    # We initialize them with empty strings so they are object dtype.
    df_cis_controls_to_csf2["CIS Control title"] = ""
    df_cis_controls_to_csf2["CIS Control desc"]  = ""

    # We'll maintain the current preamble values (start with None or empty string)
    current_title = ""
    current_desc  = ""

    # List to track the indices of preamble rows for removal.
    rows_to_remove = set()

    # Loop through the rows by index.
    # (Assume the DataFrame index is sequential: 0, 1, 2, ...)
    for i in range(len(df_cis_controls_to_csf2)):
        # Check if we are at a potential preamble start: ensure we are not at the last row.
        if i < len(df_cis_controls_to_csf2) - 1:
            current_control = df_cis_controls_to_csf2.at[i, "CIS Control"]
            next_control    = df_cis_controls_to_csf2.at[i+1, "CIS Control"]
            
            # Debug print (optional)
            # print(f"Row {i}: CIS Control = '{current_control}', Row {i+1}: CIS Control = '{next_control}'")
            
            # If current row has a value and the next row is blank, we have a preamble pair.
            if (not pd.isna(current_control) and str(current_control).strip() != "") and \
            (pd.isna(next_control) or str(next_control).strip() == ""):
                
                # Update our current preamble values.
                current_title = df_cis_controls_to_csf2.at[i, "Title"]
                current_desc  = df_cis_controls_to_csf2.at[i+1, "Title"]
                
                # Mark both rows (i and i+1) to be removed.
                rows_to_remove.add(i)
                rows_to_remove.add(i+1)
                
                # Skip to the next iteration (i+1 will still be processed by the loop but then removed)
                continue
        
        # For all rows that are not part of a preamble pair,
        # assign the most recent preamble values.
        df_cis_controls_to_csf2.at[i, "CIS Control title"] = current_title
        df_cis_controls_to_csf2.at[i, "CIS Control desc"]  = current_desc

    # After looping, drop the preamble rows.
    df_cis_controls_to_csf2.drop(rows_to_remove, inplace=True)
    df_cis_controls_to_csf2.reset_index(drop=True, inplace=True)

    # TESTING - Print out information for each DataFrame
    print_df_info("CIS Controls v8 to NIST CSFv2", df_cis_controls_to_csf2)

    # TODO - define mapping and linking configs

    # ----------------------------------------------------------------------
    # Prepare mapping/crosswalk tables to be used for linking
    # ----------------------------------------------------------------------

    # 1) CRI -> NIST CSFv2
    

    # 2) NIST -> Mitre ATT&CK


    # 3) Mitre ATT&CK -> D3FEND


    # 4) Mitre ATT&CK -> NIST CSFv2


    # 5) Mitre ENGAGE -> ATT&CK


    # 6) Mitre D3FEND -> NIST 800-53 Controls


    # 7) CIS Controls v8 -> NIST CSFv2


    # CROSSWALKS/MAPPING DATFRAMES
    print_df_info("CRI NIST CSF Mapping", df_cri_nist_mapping)
    print_df_info("NIST to Mitre ATT&CK", df_nist_to_attack)
    print_df_info("Mitre ATT&CK to D3FEND", df_mitre_attack_to_defend)
    print_df_info("Mitre ATT&CK to NIST CSFv2", df_mitre_attack_to_csf2)
    print_df_info("Mitre ENGAGE to ATT&CK", df_mitre_engage_to_attack)
    print_df_info("Mitre D3FEND to NIST 800-53 Controls", df_defend_to_nist_controls)
    print_df_info("CIS Controls v8 to NIST CSFv2", df_cis_controls_to_csf2)

    #%%

    # ----------------------------------------------------------------------
    # Clean framework core dataframes to make the make the primary key or ID the most granular data
    # ----------------------------------------------------------------------
    '''
    - This involves deduplicating the data so that the ID/primary key of each row is unique
    - This means that the represented data will be about each code in that framework and not about
      a more granular components of the framework
    '''

    def deduplicate_by_id(df, id_col, keep_cols=None):
        """
        Deduplicate rows by `id_col`, optionally only keeping certain columns.
        We pick the first occurrence and drop any duplicates.
        """
        if keep_cols is not None:
            # keep only these columns + id_col
            columns_to_keep = [id_col] + keep_cols
            columns_to_keep = list(dict.fromkeys(columns_to_keep))  # preserve order, remove duplicates
            df = df[columns_to_keep]
        df = df.drop_duplicates(subset=[id_col], keep="first")
        return df.reset_index(drop=True)
    
    df_cri_core.drop_duplicates(subset=['Profile Id'], keep='first', inplace=True)
    df_nist_core.drop_duplicates(subset=['Control Identifier'], keep='first', inplace=True)
    df_mitre_attack.drop_duplicates(subset=['ID'], keep='first', inplace=True)
    df_engage_core.drop_duplicates(subset=['ID'], keep='first', inplace=True)
    df_defend.drop_duplicates(subset=['ID'], keep='first', inplace=True)
    df_csf2.drop_duplicates(subset=['CSF / Profile Id'], keep='first', inplace=True)
    df_cis_controls.drop_duplicates(subset=['CIS Control'], keep='first', inplace=True)

    # CORE FRAMEWORK DATAFRAMES
    print_df_info("Merged CRI Core Data", df_cri_core)
    print_df_info("NIST 800-53 Core", df_nist_core)
    print_df_info("Mitre ATT&CK Core", df_mitre_attack)
    print_df_info("Mitre ENGAGE Core", df_engage_core)
    print_df_info("Mitre D3FEND", df_defend)
    print_df_info("NIST CSFv2 Core", df_csf2)
    print_df_info("CIST Controls v8", df_cis_controls)

    #%%

    # ----------------------------------------------------------------------
    # Group dataframes into a dictionary
    # ----------------------------------------------------------------------

    framework_data = {
        "FRAMEWORK_NAME_HERE": df_here
    }

    for name, df in framework_data.items():
        print(f"{name} has shape: {df.shape}")

    ###############################################################################
    # CONFIGURATION - MARKDOWN, YAML, LINKING
    ###############################################################################


    # My ideal framework configs
    '''
    - whether the hierarchy is stored across columns or in some notation in one column per each framework
    - how to build the folder and file names - append codes, use component of code, etc.
    - which key:value (column) data to append to frontmatter and which has headings.  We should be able to define this as an object with the top level being a heading 1
    - column renaming if need be via dictionary
    - if primary key / ID is more granular or not - if not, then an object has to be defined to break down the additional granular data for each
        - This can be accounted for by deduping and getting rid of unimportant columns till the code is improved to account for this data
          translation problem
    - 
    '''

    # My ideal link configs
    '''
    - direction - defining where to put links (at the destination or at the source or the reference)
    - source and target columns
    - mode if necessary to match values (somtimes the other column will need to match by regex or something else)
    '''


# WORKSPACE - leftover code and stuff that could be used later

# # Select tables
#     left_table = df_nist_controls
#     right_table = df_nist_assessment

#     # Compute the total number of comparisons.
#     total_iterations = len(left_table) * len(right_table)

#     # Create a single tqdm progress bar.
#     pbar = tqdm(total=total_iterations, desc="Total comparisons", unit="iter")

#     # keys to merge on
#     left_key = "Control Identifier"
#     right_key = "identifier"

#     # Prepare a list to collect merged rows (as dictionaries).
#     merged_data = []

#     # Loop over the rows in the left table.
#     for row1 in left_table.itertuples(index=False):
#         value1 = getattr(row1, left_key)
#         value1_lower = str(value1).lower()
#         # Loop over the rows in the right table.
#         for row2 in right_table.itertuples(index=False):
#             value2 = getattr(row2, right_key)
#             value2_lower = str(value2).lower()
#             # Check if one string is contained in the other (case-insensitive).
#             if value1_lower in value2_lower or value2_lower in value1_lower:
#                 sim = 1  # A full match (you can adjust this logic if needed)
#                 merged_row = {}
#                 # Add every field from row1 from left_table with a '_ctrl' suffix.
#                 for field in row1._fields:
#                     merged_row[field + "_ctrl"] = getattr(row1, field)
#                 # Add every field from row2 from right_table with a '_assess' suffix.
#                 for field in row2._fields:
#                     merged_row[field + "_assess"] = getattr(row2, field)
#                 merged_row[similarity_col] = sim
#                 merged_data.append(merged_row)
#             # Update the progress bar on every inner loop iteration.
#             pbar.update(1)
#     # Close the progress bar.
#     pbar.close()

#     # # Loop over rows in df_nist_controls (outer loop) with a progress bar.
#     # for row1 in tqdm(left_table.itertuples(index=False),
#     #              total=len(left_table),
#     #              desc="Fuzzy-merging NIST data",
#     #              unit="row"):
#     #     # Since itertuples converts column names with spaces to underscores,
#     #     # we make that adjustment for df_nist_controls.
#     #     value1 = getattr(row1, left_key.replace(" ", "_"))
#     #     value1_lower = str(value1).lower()
#     #     # Inner loop: iterate over rows in df_nist_assessment.
#     #     for row2 in right_table.itertuples(index=False):
#     #         value2 = getattr(row2, right_key)
#     #         value2_lower = str(value2).lower()
#     #         # Instead of computing a Jaccard similarity, we check if one value contains the other.
#     #         if value1_lower in value2_lower or value2_lower in value1_lower:
#     #             # If the condition is met, we record a match with a similarity of 1.
#     #             sim = 1  
#     #             # Merge the two rows into one dictionary.
#     #             merged_row = {}
#     #             # Add every field from df_nist_controls with a '_ctrl' suffix.
#     #             for field in row1._fields:
#     #                 merged_row[field + "_ctrl"] = getattr(row1, field)
#     #             # Add every field from df_nist_assessment with a '_assess' suffix.
#     #             for field in row2._fields:
#     #                 merged_row[field + "_assess"] = getattr(row2, field)
#     #             # Record the similarity measure.
#     #             merged_row[similarity_col] = sim
#     #             merged_data.append(merged_row)

#     merged_df = pd.DataFrame(merged_data)

#     # # Loop over rows in df1 (outer loop) with a progress bar.
#     # for row1 in tqdm(df_nist_controls.itertuples(index=False), desc="Fuzzy-merging NIST data", unit="row"):
#     #     value1 = getattr(row1, left_key.replace(" ", "_"))
#     #     # Inner loop: iterate over rows in df2.
#     #     for row2 in df_nist_assessment.itertuples(index=False):
#     #         value2 = getattr(row2, right_key)
#     #         sim = jaccard_similarity(str(value1), str(value2))
#     #         if sim > similarity_threshold:
#     #             # Merge the two rows into one dictionary.
#     #             merged_row = {}
#     #             # Add every field from df1 with a '_1' suffix.
#     #             for field in row1._fields:
#     #                 merged_row[field + "_1"] = getattr(row1, field)
#     #             # Add every field from df2 with a '_2' suffix.
#     #             for field in row2._fields:
#     #                 merged_row[field + "_2"] = getattr(row2, field)
#     #             # Record the similarity measure.
#     #             merged_row[similarity_col] = sim
#     #             merged_data.append(merged_row)
#     # merged_df = pd.DataFrame(merged_data)

#     # df_nist_core_merged = pd.merge(
#     #     df_nist_controls,
#     #     df_nist_assessment,
#     #     how='left',
#     #     left_on='Control Identifier',
#     #     right_on='identifier',
#     #     suffixes=('', '_remove')
#     # ).progress_apply(lambda x: x)

# # Here we assume that the controls table's "Control_Identifier" column already follows
#     # the format we want (e.g. "AC-1", "AC-2", "AC-2(1)", etc.). If you need additional cleaning
#     # for controls keys, you can apply a similar inline lambda.
#     df_nist_controls["merge_key"] = df_nist_controls["Control Identifier"]

#     # Instead of merging the entire controls table at once, split it into chunks for progress feedback.
#     chunk_size = 100
#     chunks = [df_nist_controls.iloc[i:i+chunk_size] for i in range(0, len(df_nist_controls), chunk_size)]
#     merged_list = []
#     pbar = tqdm(total=len(chunks), desc="Merging NIST Controls & Assessment", unit="chunk")
#     for chunk in chunks:
#         merged_chunk = pd.merge(
#             chunk,
#             df_nist_assessment,
#             on="merge_key",
#             how="left",
#             suffixes=("_ctrl", "_assess")
#         )
#         merged_list.append(merged_chunk)
#         pbar.update(1)
#     pbar.close()
#     df_nist_core_merged = pd.concat(merged_list, axis=0)

# # Example Jaccard similarity function.
# def jaccard_similarity(str1, str2):
#     """
#     Compute a Jaccard similarity between two strings based on words.
#     """
#     set1 = set(re.split(r'\W+', str1.lower()))
#     set2 = set(re.split(r'\W+', str2.lower()))
#     # Remove empty strings that might occur due to splitting
#     set1.discard('')
#     set2.discard('')
#     if not set1 or not set2:
#         return 0
#     intersection = set1.intersection(set2)
#     union = set1.union(set2)
#     return len(intersection) / len(union)


# df_defend_full_mapping["def_tech_id"] = df_defend_full_mapping["def_tech"].str.extract(r'#(D3-[A-Za-z0-9\-]+)$')
    # df_defend_merged = pd.merge(
    #     df_defend,                 # your D3FEND Core
    #     df_defend_full_mapping,            # your D3FEND Full Data
    #     how="left",
    #     left_on="ID",              # e.g. "D3-OAM"
    #     right_on="def_tech_id"     # e.g. "D3-OAM"
    # )

    # tqdm.pandas(desc="[+] Merging Mitre D3FEND Core")

    # df_defend_core_merge = pd.merge(
    #     df_defend,
    #     df_defend_full_mapping,
    #     on="merge_key",
    #     how="left",
    #     suffixes=("_ctrl", "_assess")
    # ).progress_apply(lambda x: x)
# %%
```

---

---

---

FRAMEWORK CROSSWALK DATA BELOW


[Framework Mapping](../../../📁%2005%20-%20Organizational%20Cyber/Frameworks,%20Standards/Framework%20Mapping/Framework%20Mapping.md)
[Mapping Cyber Frameworks to Obsidian](../Mapping%20Frameworks%20to%20Obsidian/Mapping%20Cyber%20Frameworks%20to%20Obsidian.md)

# NIST CSF 2.0 Community Profiles

## CRI - Cyber Risk Institute (Financial Institutions)

- [The Profile – Cyber Risk Institute](https://cyberriskinstitute.org/the-profile/#Recognition)

`Final-CRI-Profile-v2.0-Public-CRI.xlsx`

Sheets & Mapping Columns:
- CRI Profile v2.0 Structure
	- Profile Id
	- Outline ID
	- NIST CSF v2\n Mapping
	- FS References
- Diagnostic Statements by Tag
	- CRI Profile Subject Tags
	- Profile Id
	- Outline Id
	- Profile Subcategory
- NIST CSF v2 Mapping
	- CSF Profile Id
	- Rationale
	- Relationship
	- Profile Id
- FFIEC CAT to Profile Mapping
	- CAT Domain / Factor / Component
	- CAT Level
	- Mapping Type
	- Profile Id
- FFIEC AIO Mapping
	- Objective Id
	- Rationale
	- Relationship
	- Profile ID
- FFIEC BCM Mapping
	- FFIEC BCM Id
	- Rationale
	- Relationship
	- Profile Id
- CISA CPG 1.0.1 Mapping
	- CSF Function
	- CPG Id
	- CRI Profile Subcategory
	- CRI Profile v2.0 Diagnostic Statement
- NIST Ransomware Profile
	- CSF Function
	- CSF Category
	- CSF Subcategory
	- Ransomware Application
	- CRI Profile v2.0 Diagnostic Statement

# NIST CSF 2.0

[CSF 2.0 Informative References | NIST](https://www.nist.gov/informative-references)

# NIST SP 800-53 Rev. 5

## NIST SP 800-53 Rev. 5 - Controls Catalog

[SP 800-53 Rev. 5, Security and Privacy Controls for Information Systems and Organizations | CSRC](https://csrc.nist.gov/pubs/sp/800/53/r5/upd1/final)

`sp800-53r5-control-catalog.xlsx`

Sheets & Columns:
- SP 800-53 Revision 5
	- Control Identifier
	- Control (or Control Enhancement) Name
	- Control Text
	- Discussion
	- Related Controls

## NIST SP 800-53 - Assessment Procedures

[SP 800-53A Rev. 5, Assessing Security and Privacy Controls in Information Systems and Organizations | CSRC](https://csrc.nist.gov/pubs/sp/800/53/a/r5/final)
- "Download Spreadsheet"

`sp800-53ar5-assessment-procedures.xlsx`

Sheets & Columns:
- family
- identifier
- sort-as
- control-name
- assessment-objective
- EXAMINE
- INTERVIEW
- TEST

# Mitre ATT&CK + NIST 800-53

[NIST 800-53 Landing – Mappings Explorer](https://center-for-threat-informed-defense.github.io/mappings-explorer/external/nist/)

`nist_800_53-rev5_attack-14.1-enterprise.xlsx`

Sheets & Columns:
- mapping_framework
- mapping_framework_version
- capability_group
- capability_id
- capability_description
- mapping_type
- attack_object_id
- attack_object_name
- attack_version
- technology_domain
- references
- comments
- creation_date
- last_update

# Mitre ENGAGE

[Tools | MITRE Engage™](https://engage.mitre.org/tools/)
- "Raw Engage Matrix Data"

`Engage-Data-V1.0.xlsx`

Sheets & Columns:
- ATT&CK ICS ID
- ATT&CK Technique Name
- eav_id
- EAV (Engage Vulnerability)
- eac_id
- eac
- created
- last modified
- version

# Mitre D3FEND Mappings

[Resources | MITRE D3FEND™](https://d3fend.mitre.org/resources/)

## ATT&CK Mitigations to D3FEND Techniques

[ATT&CK Mitigations to D3FEND Mappings | MITRE D3FEND™](https://d3fend.mitre.org/mappings/attack-mitigations/)

Columns:
- ATT&CK ID
- ATT&CK Enterprise Mitigation
- Related D3FEND Techniques
- Comment

## Semantic D3FEND Mappings to NIST 800-53

[Semantic D3FEND Mappings to NIST 800-53 | MITRE D3FEND™](https://d3fend.mitre.org/mappings/nist/5/)

`nist.5.csv`

Columns:
- Catalog
- Control
- Relation
- Defensive Technique
- Technique

# Mitre ATT&CK

- [ATT&CK Data & Tools | MITRE ATT&CK®](https://attack.mitre.org/resources/attack-data-and-tools/)

Sheets & Columns:
- techniques
	- ID
	- STIX ID
	- name
	- description
	- url
	- created
	- last modified
	- domain
	- version
	- tactics
	- detection
	- platforms
	- data sources
	- is sub-technique
	- sub-technique of
	- defenses bypassed
	- supports remote
	- system requirements
	- impact type
	- effective permissions
- relationships
	- source ID
	- target ID
	- mapping type

# Mitre DETTECT

- [rabobank-cdc/DeTTECT: Detect Tactics, Techniques & Combat Threats](https://github.com/rabobank-cdc/DeTTECT)
- 

# NIST CSF Crosswalks (more)

- [GDPR Crosswalk by Enterprivacy Consulting Group | NIST](https://www.nist.gov/privacy-framework/resource-repository/browse/crosswalks/gdpr-crosswalk-enterprivacy-consulting-group)
- [National Online Informative References Program | CSRC](https://csrc.nist.gov/projects/olir/informative-reference-catalog#/)
- [CIS Critical Security Controls v8 Mapping to NIST CSF](https://www.cisecurity.org/insights/white-papers/cis-controls-v8-mapping-to-nist-csf)
- 

# CIS Controls

- https://learn.cisecurity.org/cis-controls-download

# Master Frameworks Reference

## Framework: Cyber Risk Institute (CRI)

**Data Source**: `./Frameworks/Final-CRI-Profile-v2.0-Public-CRI.xlsx`

### Sheet: CRI Profile v2.0 Structure

| Column Name                           | Example Values                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              | Mapped to (Other Table / Column) | Notes |
| ------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------- | ----- |
| Outline Id                            | `['1.0', '2.0', '3.0', '3.001', '4.0']`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |                                  |       |
| Level                                 | `['F', 'C', 'S', 'DS']`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |                                  |       |
| Profile Id                            | `['GV', 'GV.OC', 'GV.OC-01', 'GV.OC-01.01', 'GV.OC-02']`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |                                  |       |
| Category / Subcategory                | `['GOVERN', 'GOVERN / Organizational Context', 'GOVERN / Organizational Context / Organizational Mission', 'GOVERN / Organizational Context / Stakeholder Risk Management Expectations', 'GOVERN / Organizational Context / Legal, Regulatory, & Contractual Requirements']`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |                                  |       |
| CRI Profile v2.0 Diagnostic Statement | `["GOVERN (GV): The organization's technology and cybersecurity risk management strategy, expectations, and policy are established, communicated, and monitored", "Organizational Context (GV.OC): The circumstances - mission, stakeholder expectations, dependencies, and legal, regulatory, and contractual requirements - surrounding the organization's technology and cybersecurity risk management decisions are understood", 'GV.OC-01: The organizational mission is understood and informs technology and cybersecurity risk management', "GV.OC-01.01: Technology and cybersecurity strategies, architectures, and programs are formally governed to align with and support the organization's mission, objectives, priorities, tactical initiatives, and risk profile.", 'GV.OC-02: Internal and external stakeholders are understood, and their needs and expectations regarding technology and cybersecurity risk management are understood and considered']` |                                  |       |
| Tier-1                                | `['Yes']`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |                                  |       |
| Tier-2                                | `['Yes', 'No']`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |                                  |       |
| Tier-3                                | `['Yes', 'No']`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |                                  |       |
| Tier-4                                | `['Yes', 'No']`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |                                  |       |
| Mapping                               | `['GV (CRI Modified)', 'GV.OC (CRI Modified)', 'GV.OC-01 (CRI Modified)', 'GV.OC-01 ', 'GV.OC-02 (CRI Modified)']`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |                                  |       |
| FS References                         | `['EBA (2), ECB (3), FFIEC AIO (9), FFIEC CAT (2), MAS (1), NYDFS (1), OCC (1)', 'EBA (3), ECB (5), FFIEC AIO (1), JFSA (2), MAS (1), NYDFS (1), OCC (1)', 'EBA (2), ECB (4), FFIEC AIO (1), FFIEC CAT (2), JFSA (1), OCC (4)', 'EBA (2), ECB (3), FFIEC AIO (1), FFIEC CAT (3), JFSA (1), NYDFS (1), OCC (1)', 'EBA (2), ECB (3), FFIEC AIO (1), FFIEC CAT (1), NYDFS (1), OCC (1), SEC 2023 (4)']`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |                                  |       |
|                                       |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |                                  |       |

### Sheet: Diagnostic Statements by Tag

| Column Name | Example Values | Mapped to (Other Table / Column) | Notes |
|------------|----------------|-----------------------------------|-------|
| CRI Profile Subject Tags | `['#access_management', '#application_security', '#application_security_testing', '#architecture', '#asset_classification_and_criticality']` |  |  |
| CRI Profile ver. 2.0 Diagnostic Statement | `['GV.RR-04.02: The organization establishes processes and controls to mitigate cyber risks related to employment termination, as permitted by law, to include the return or disposition of all organizational assets.', 'PR.AA-05.02: The organization institutes controls over privileged system access by strictly limiting and closely managing staff and services with elevated system entitlements (e.g., multi-factor authentication, dual accounts, privilege and time constraints, etc.)', 'PR.AA-05.03: The organization institutes controls over service account (i.e., accounts used by systems to access other systems) lifecycles to ensure strict security over creation, use, and termination; access credentials (e.g., no embedded passwords in code); frequent reviews of account ownership; visibility for unauthorized use; and hardening against malicious insider use.', 'PR.AA-05.04: Specific roles, responsibilities, and procedures to manage the risk of third-party access to organizational systems and facilities are defined and implemented.', 'ID.RA-06.06: The organization follows documented procedures, consistent with established risk response processes, for mitigating or accepting the risk of vulnerabilities or weaknesses identified in exercises and testing or when responding to incidents.']` |  |  |
| Profile Subcategory | `['GOVERN / Roles, Responsibilities, and Authorities / Human Resource Practices', 'PROTECT / Identity Management, Authentication, and Access Control / Access Authorizations', 'IDENTIFY / Risk Assessment / Risk Response Determination', 'IDENTIFY / Risk Assessment / Change & Exception Management', 'PROTECT / Platform Security / Configuration Management']` |  |  |
| Profile Id | `['GV.RR-04.02', 'PR.AA-05.02', 'PR.AA-05.03', 'PR.AA-05.04', 'ID.RA-06.06']` |  |  |
| Outline Id | `['22.057', '74.17', '74.171', '74.172', '60.13']` |  |  |

### Sheet: NIST CSF v2 Mapping

| Column Name | Example Values | Mapped to (Other Table / Column) | Notes |
|------------|----------------|-----------------------------------|-------|
| Seq | `['1', '2', '3', '4', '5']` |  |  |
| CSF / Profile Id | `['GV', 'GV.OC', 'GV.OC-01', 'GV.OC-02', 'GV.OC-03']` |  |  |
| Level | `['F', 'C', 'S']` |  |  |
| NIST CSF v2 Statement | `["GOVERN (GV): The organization's cybersecurity risk management strategy, expectations, and policy are established, communicated, and monitored", "Organizational Context (GV.OC): The circumstances - mission, stakeholder expectations, dependencies, and legal, regulatory, and contractual requirements - surrounding the organization's cybersecurity risk management decisions are understood", 'GV.OC-01: The organizational mission is understood and informs cybersecurity risk management', 'GV.OC-02: Internal and external stakeholders are understood, and their needs and expectations regarding cybersecurity risk management are understood and considered', 'GV.OC-03: Legal, regulatory, and contractual requirements regarding cybersecurity - including privacy and civil liberties obligations - are understood and managed']` |  |  |
| Rationale | `['Semantic', 'Syntactic', 'Functional']` |  |  |
| Relationship | `['subset of', 'equal', 'not related to', 'intersects with']` |  |  |
| CRI Mapping Note | `['(CRI Modified)', 'Same', '(CRI Addition)', '(CRI Expanded)']` |  |  |
| CRI Profile ver. 2.0 Statement | `["GOVERN (GV): The organization's technology and cybersecurity risk management strategy, expectations, and policy are established, communicated, and monitored", "Organizational Context (GV.OC): The circumstances - mission, stakeholder expectations, dependencies, and legal, regulatory, and contractual requirements - surrounding the organization's technology and cybersecurity risk management decisions are understood", 'GV.OC-01: The organizational mission is understood and informs technology and cybersecurity risk management', 'GV.OC-02: Internal and external stakeholders are understood, and their needs and expectations regarding technology and cybersecurity risk management are understood and considered', 'GV.OC-03: Legal, regulatory, and contractual requirements regarding technology and cybersecurity - including privacy and civil liberties obligations - are understood and managed']` |  |  |
| CRI Profile Level | `['GOVERN', 'GOVERN / Organizational Context', 'GOVERN / Organizational Context / Organizational Mission', 'GOVERN / Organizational Context / Stakeholder Risk Management Expectations', 'GOVERN / Organizational Context / Legal, Regulatory, & Contractual Requirements']` |  |  |
| Profile Id | `['GV', 'GV.OC', 'GV.OC-01', 'GV.OC-02', 'GV.OC-03']` |  |  |

### Sheet: FFIEC CAT to Profile Mapping

| Column Name | Example Values | Mapped to (Other Table / Column) | Notes |
|------------|----------------|-----------------------------------|-------|
| CAT Domain / Factor / Component | `['1: Cyber Risk Management & Oversight / 1: Governance / 1: Oversight', '1: Cyber Risk Management & Oversight / 1: Governance / 2: Strategy / Policies', '1: Cyber Risk Management & Oversight / 1: Governance / 3: IT Asset Management', '1: Cyber Risk Management & Oversight / 2: Risk Management / 1: Risk Management Program', '1: Cyber Risk Management & Oversight / 2: Risk Management / 2: Risk Assessment']` |  |  |
| FFIEC CAT Statement | `['D1.G.Ov.B.1: Designated members of management are held accountable by the board or an appropriate board committee for implementing and managing the information security and business continuity programs.', 'D1.G.Ov.B.2: Information security risks are discussed in management meetings when prompted by highly visible cyber events or regulatory alerts.', 'D1.G.Ov.B.3: Management provides a written report on the overall status of the information security and business continuity programs to the board or an appropriate board committee at least annually.', 'D1.G.Ov.B.4: The budgeting process includes information security related expenses and tools.', 'D1.G.Ov.B.5: Management considers the risks posed by other critical infrastructures (e.g., telecommunications, energy) to the institution.']` |  |  |
| CAT Level | `['Baseline', 'Evolving', 'Intermediate', 'Advanced', 'Innovative']` |  |  |
| Mapping Type | `['Full Summarily', 'Full', 'Partial']` |  |  |
| CRI Profile v2.0 Diagnostic Statement | `['GV.RR-01.01: The governing authority (e.g., the Board or one of its committees) oversees and holds senior management accountable for implementing the organization’s technology and cybersecurity risk management strategies and frameworks.', "GV.RR-01.03: The governing authority (e.g., the Board or one of its committees) regularly reviews, oversees, and holds senior management accountable for implementing the organization’s resilience strategy and program and for managing the organization's ongoing resilience risks.", 'GV.RM-05.01: The organization has a process for monitoring its technology, cybersecurity, and third-party risks, including escalating those risks that exceed risk appetite to management and identifying risks with the potential to impact multiple operating units.', 'GV.OV-01.02: The designated Cybersecurity Officer (e.g., CISO) periodically reports to the appropriate governing authority (e.g., the Board or one of its committees) or equivalent governing body on the status of cybersecurity within the organization.', 'GV.OV-03.02: Resilience program performance is measured and regularly reported to senior executives and the governing authority (e.g., the Board or one of its committees).']` |  |  |
| Profile Id | `['GV.RR-01.01', 'GV.RR-01.03', 'GV.RM-05.01', 'GV.OV-01.02', 'GV.OV-03.02']` |  |  |
| CRI Profile Subcategory | `['GOVERN / Roles, Responsibilities, and Authorities / Organizational Leadership Responsibility', 'GOVERN / Risk Management Strategy / Lines of Communication', 'GOVERN / Oversight / Risk Management Strategy Outcomes Review', 'GOVERN / Oversight / Risk Management Performance Measurement', 'GOVERN / Roles, Responsibilities, and Authorities / Resource Adequacy']` |  |  |

### Sheet: FFIEC AIO Mapping

| Column Name | Example Values | Mapped to (Other Table / Column) | Notes |
|------------|----------------|-----------------------------------|-------|
| FFIEC AIO Objective Area | `['Objective #2: Management promotes and provides effective governance of AIO functions through defined responsibilities, accountability, and adequate resources to support these functions. ', 'Objective #3: Management understands the common risks and mitigating controls related to data governance and data management.', 'Objective #4: Management implements appropriate ITAM processes to track, manage, and report on the entity’s information and technology assets.', 'Objective #5: Management understands the documentation maintained to represent the entity’s IT and business environment.', 'Objective #6: Management fosters effective management of change across the AIO functions.']` |  |  |
| Objective Id | `['FFIEC-AIO-02.01', 'FFIEC-AIO-02.02', 'FFIEC-AIO-02.03', 'FFIEC-AIO-02.04', 'FFIEC-AIO-02.05']` |  |  |
| FFIEC AIO Objective Statement | `['Management should implement a process to continuously manage technology to support operational needs and mitigate AIO-related risks. The entity’s risk management processes should include the following governance mechanisms:  a. Delineation of board and senior management responsibilities.  b. Strategic planning.  c. ERM.  d. Delineation of other roles and responsibilities.  e. Policies, standards, and procedures.  f. Internal audit, independent reviews, and certifications.  g. Communications.  h. Board and senior management reporting. ', "The entity's oversight of AIO functions should include the following:  a. Board and senior management consideration of the entity’s business objectives, including functions performed by affiliates and third-party service providers.  b. Management identification and evaluation of AIO-related risks, definition of short- and long-term objectives, and creation of policies and procedures to mitigate those risks.  c. Management consideration of security and resilience in the design of new products and services. ", "The board's oversight of AIO functions should include the following:  a. Aligning AIO principles and practices with the board’s strategic plans and risk appetite.  b. Budgeting appropriate resources to support AIO activities.  c. Ensuring board members have appropriate knowledge of risks to provide a credible challenge to management.  d. Enabling appropriate management training on AIO to carry out its responsibilities and manage risk.  e. Reviewing AIO operating results and performance (e.g., audit reporting, testing results, and management and assessment reports). ", 'Management oversight of AIO functions should include the following:  a. Validating through audits and other independent assessments that the following are comprehensive, meet enterprise-wide business and strategic plan objectives, and can assist in the identification of AIO-related risk.  - Architectural designs and integration across the entity.  - Infrastructure testing.  - Operational testing.  b. Addressing risks self-identified by management, from AIO-related audits, and from other independent assessments.  c. Assessing and updating management’s strategies and plans for AIO functions.  d. Promoting alignment and integration between functions of AIO. ', 'The board and senior management should evaluate whether the IT strategic plan aligns with the enterprise-wide business and strategic plan, as well as established priorities and whether the planning addresses the following:  a. Participation of senior management by supporting AIO activities, confirming that those activities are in the IT strategic plan, reviewing the strategic planning process, and incorporating changes.  b. Responsibilities within the AIO functions through defining those responsibilities and determining the effectiveness of the IT strategic planning process.  c. Evaluation of architecture, including the entity’s current architecture and whether it meets enterprise-wide business and strategic plan objectives.  d. Impact of IT infrastructure by understanding the relationship between IT infrastructure and the entity’s needs.  e. Post-implementation evaluation of the performance and results of IT projects and initiatives to determine whether each project achieved the anticipated goals. ']` |  |  |
| Rationale | `['Semantic', 'Functional ']` |  |  |
| Relationship | `['Superset of', 'Intersects with', 'Subset of ']` |  |  |
| AS | `['8', '6', '7', '9', '4']` |  |  |
| FCS | `['10', '9', '7', '8', '6']` |  |  |
| CRI Profile ver. 2.0 Diagnostic Statement | `["GV.OC-01.01: Technology and cybersecurity strategies, architectures, and programs are formally governed to align with and support the organization's mission, objectives, priorities, tactical initiatives, and risk profile.", "GV.OC-02.01: The organization's obligation to its customers, employees, and stakeholders to maintain safety and soundness, while balancing size and complexity, is reflected in the organization's risk management strategy and framework,  its risk appetite and risk tolerance statements, and in a risk-aware culture.", 'GV.OC-02.02: Technology and cybersecurity risk management strategies identify and communicate the organization’s role within the financial services sector as a component of critical infrastructure.', "GV.OC-02.03: Technology and cybersecurity risk management strategies identify and communicate the organization's role as it relates to other critical infrastructure sectors outside of the financial services sector and the interdependency risks.", "GV.OC-03.01: The organization's technology and cybersecurity strategy, framework, and policies align and are consistent with the organization's legal, statutory, contractual, and regulatory obligations and ensure that compliance responsibilities are unambiguously assigned."]` |  |  |
| Profile Subcetegory | `['GOVERN / Organizational Context / Organizational Mission', 'GOVERN / Organizational Context / Stakeholder Risk Management Expectations', 'GOVERN / Organizational Context / Legal, Regulatory, & Contractual Requirements', 'GOVERN / Risk Management Strategy  / Technology Assimilation & Implementations', 'GOVERN / Supply Chain Risk Management / Third Party Roles & Responsibilities']` |  |  |
| Profile Id | `['GV.OC-01.01', 'GV.OC-02.01', 'GV.OC-02.02', 'GV.OC-02.03', 'GV.OC-03.01']` |  |  |

### Sheet: FFIEC BCM Mapping

| Column Name | Example Values | Mapped to (Other Table / Column) | Notes |
|------------|----------------|-----------------------------------|-------|
| FFIEC BCM Examination Objective | `['Objective 2: Determine whether the board and senior management promote effective governance of business continuity through defined responsibilities, accountability, and adequate resources to support the program.', 'Objective 3: Determine whether the board and senior management engage audit or other independent review functions to review and validate the design and operating effectiveness of the BCM program.', 'Objective 4: Determine whether management developed an appropriate and repeatable BIA process that identifies all business functions and prioritizes them in order of criticality, analyzes related interdependencies, and assesses a disruption’s impact. ', 'Objective 5: Determine whether management conducts a risk assessment sufficient to evaluate the likelihood and impact of potential disruptions and events.', 'Objective 6: Determine whether the entity’s risk management strategies are designed to achieve resilience.']` |  |  |
| FFIEC BCM Id | `['FFIEC-BCM-02.01', 'FFIEC-BCM-02.02', 'FFIEC-BCM-02.03', 'FFIEC-BCM-02.04', 'FFIEC-BCM-02.05']` |  |  |
| FFIEC BCM Examination Procedure | `['1. Determine whether business continuity policies and critical business procedures are: a. Up-to-date and reflective of the current business environment. b. Communicated effectively throughout the entity. c. Available during adverse events. d. Securely maintained.', '2. Determine whether the board and senior management provide leadership when overseeing business continuity, including: a. Evaluating continuity risk. b. Setting short- and long-term continuity objectives. c. Adopting appropriate policies and procedures. d. Evaluating continuity performance. e. Adjusting programs and operations in response to test results and actual events.', '3. Determine whether management strengthens resilience through the following: a. Assessing continuity risk. b. Resilience planning. c. Testing business continuity plans. d. Incorporating lessons learned from testing and events. e. Considering resilience in business functions and the design of existing operations and new products and services.', '4. Determine whether board oversight includes the following: a. Assigning business continuity responsibility and accountability. b. Allocating resources to business continuity (e.g., personnel, time, budget, and training). c. Aligning BCM with business strategy and risk appetite. d. Understanding business continuity risks and adopting appropriate policies and plans to manage events. e. Understanding business continuity operating results and performance. f. Providing a credible challenge to management responsible for the business continuity process (e.g., the board minutes provide evidence of active discussions). g. Establishing a provision for management intervention if timeliness for corrective action is not met. ', '5. Determine whether management oversight of business continuity includes the following: a. Defining business continuity roles, responsibilities, and succession plans. b. Allocating knowledgeable personnel and sufficient financial resources. c. Validating that personnel understand their business continuity roles. d. Establishing measurable goals against which business continuity performance is assessed. e. Designing and implementing a business continuity exercise strategy. f. Confirming that tests, training, and exercises are comprehensive and consistent with the exercise strategy. g. Resolving weaknesses identified in tests, training, and exercises. h. Meeting regularly to discuss policy changes, training, and testing plans. i. Assessing and updating business continuity strategies and plans to reflect the current business conditions and operating environment for continuous improvement. j. Aligning plans between business units across the enterprise. k. Coordinating plans and responses with external entities.']` |  |  |
| Rationale | `['Semantic', 'Functional ']` |  |  |
| Relationship | `['Subset of ', 'Superset of', 'Intersects with', 'Equal']` |  |  |
| AS | `['6', '8', '9', '4', '7']` |  |  |
| FCS | `['8', '10', '9', '7', '6']` |  |  |
| CRI Profile ver. 2.0 Diagnostic Statement | `['GV.RM-09.02: The resilience program ensures that the organization can continue operating critical business functions and deliver services to stakeholders, to include critical infrastructure partners, during adverse incidents and cyber attacks (e.g., propagation of malware or extended system outages).', "GV.RR-01.03: The governing authority (e.g., the Board or one of its committees) regularly reviews, oversees, and holds senior management accountable for implementing the organization’s resilience strategy and program and for managing the organization's ongoing resilience risks.", 'GV.PO-01.07: The organization maintains documented business continuity and resilience program policies and procedures approved by the governing authority (e.g., the Board or one of its committees).', "ID.IM-04.01: The organization's business continuity, disaster recovery, crisis management, and response plans are in place and managed, aligned with each other, and incorporate considerations of cyber incidents.", 'PR.AT-02.03: All personnel (employee and third party) are made aware of and are trained for their role and operational steps in response and recovery plans.']` |  |  |
| Profile Subcategory | `['GOVERN / Risk Management Strategy  / Business Continuity & Resilience Risk Management', 'GOVERN / Roles, Responsibilities, and Authorities / Organizational Leadership Responsibility', 'GOVERN / Policies, Processes, and Procedures / Establishment of Policies & Procedures', 'IDENTIFY / Improvement / Plans Affecting Operations', 'PROTECT / Awareness and Training / Specialized Role Awareness & Training']` |  |  |
| Profile Id | `['GV.RM-09.02', 'GV.RR-01.03', 'GV.PO-01.07', 'ID.IM-04.01', 'PR.AT-02.03']` |  |  |

### Sheet: CISA CPG 1.0.1 Mapping

| Column Name | Example Values | Mapped to (Other Table / Column) | Notes |
|------------|----------------|-----------------------------------|-------|
| CSF Function | `[' IDENTIFY', ' PROTECT', ' DETECT', ' RESPOND', ' RECOVER']` |  |  |
| CPG Id | `['1.A', '1.B', '1.C', '1.D', '1.E']` |  |  |
| Performance Goal Practice | `['1.A Asset Inventory: Better identify known, unknown (shadow), and unmanaged assets, and more rapidly detect and respond to new vulnerabilities.', '1.B Organizational Cybersecurity Leadership: A single leader is responsible and accountable for cybersecurity within an organization.', '1.C OT Cybersecurity Leadership: A single leader is responsible and accountable for OT-specific cybersecurity within an organization with OT assets.', '1.D Improving IT and OT Cybersecurity Relationships: Improve OT cybersecurity and more rapidly and effectively respond to OT cyber incidents.', '1.E Mitigating  Known Vulnerabilities: Reduce the likelihood of threat actors exploiting known vulnerabilities to breach organizational networks.']` |  |  |
| Performance Goal Outcome | `['Maintain a regularly updated inventory of all organizational assets with an IP address (including IPv6), including OT. This inventory is updated on a recurring basis, no less than monthly for both IT and OT.', 'A named role/position/title is identified as responsible and accountable for planning, resourcing, and execution of cybersecurity activities.  This role may undertake activities such as managing cybersecurity operations at the senior level, requesting and securing budget resources, or leading strategy development to inform future positioning.', 'A named role/position/title is identified as responsible and accountable for planning, resourcing, and execution of OT-specific cybersecurity activities. In some organizations, this may be the same position as identified in 1.B.', 'Organizations sponsor at least one "pizza party" or equivalent social gathering per year that is focused on strengthening working relationships between IT and OT security personnel and is not a working event (such as providing meals during an incident response).', "All known exploited vulnerabilities (listed in CISA's Known Exploited Vulnerabilities Catalog - https://www.cisa.gov/known-exploited-vulnerabilities-catalog) in internet-facing systems are patched or otherwise mitigated within a risk-informed span of time, prioritizing more critical assets first.    OT: For OT assets where patching is either not possible or may substantially compromise availability or safety, compensating controls are applied (e.g., segmentation, monitoring) and recorded. Sufficient controls should either make the asset inaccessible from the public internet or reduce the ability of threat actors to exploit the vulnerabilities in these assets."]` |  |  |
| CRI Profile v2.0 Diagnostic Statement | `['ID.AM-01.01: The organization maintains a current and complete asset inventory of physical devices, hardware, and information systems.', 'ID.AM-02.01: The organization maintains a current and complete inventory of software platforms, business applications, and other software assets (e.g., virtual machines and virtual network devices).', 'ID.AM-08.02: The organization establishes policies, and employs methods to identify, assess, and manage technology solutions that are acquired, managed, or used outside of established, governed technology and cybersecurity processes (i.e., "Shadow IT").', 'GV.RR-01.04: The organization has designated a qualified Cybersecurity Officer (e.g., CISO) who is responsible and accountable for developing a cybersecurity strategy, overseeing and implementing its cybersecurity program, and enforcing its cybersecurity policy.', 'GV.RR-02.01: The roles, responsibilities, qualifications, and skill requirements for personnel (employees and third parties) that implement, manage, and oversee the technology, cybersecurity, and resilience programs are defined, aligned, coordinated, and holistically managed.']` |  |  |
| CRI Profile Subcategory | `['IDENTIFY / Asset Management / Hardware Inventory', 'IDENTIFY / Asset Management / Software, Services, & Systems Inventory', 'IDENTIFY / Asset Management / Asset Life Cycle Management', 'GOVERN / Roles, Responsibilities, and Authorities / Organizational Leadership Responsibility', 'GOVERN / Roles, Responsibilities, and Authorities / Risk Management Roles & Responsibilities']` |  |  |

### Sheet: NIST Ransomware Profile

| Column Name | Example Values | Mapped to (Other Table / Column) | Notes |
|------------|----------------|-----------------------------------|-------|
| CSF Function | `[' IDENTIFY', ' PROTECT', ' DETECT', ' RESPOND', ' RECOVER']` |  |  |
| CSF Category | `['Asset Management (ID.AM): The data, personnel, devices, systems, and facilities that enable the organization to achieve business purposes are identified and managed consistent with their relative importance to organizational objectives and the organization’s risk strategy.', 'Business Environment (ID.BE): The organization’s mission, objectives, stakeholders, and activities are understood and prioritized; this information is used to inform cybersecurity roles, responsibilities, and risk management decisions.', 'Governance (ID.GV): The policies, procedures, and processes to manage and monitor the organization’s regulatory, legal, risk, environmental, and operational requirements are understood and inform the management of cybersecurity risk.', 'Risk Assessment (ID.RA): The organization understands the cybersecurity risk to organizational operations (including mission, functions, image, or reputation), organizational assets, and individuals.', 'Risk Management Strategy (ID.RM): The organization’s priorities, constraints, risk tolerances, and assumptions are established and used to support operational risk decisions.']` |  |  |
| CSF Subcategory | `['ID.AM-01: Physical devices and systems within the organization are inventoried', 'ID.AM-02: Software platforms and applications within the organization are inventoried', 'ID.AM-03: Organizational communication and data flows are mapped', 'ID.AM-04: External information systems are catalogued', 'ID.AM-05: Resources (e.g., hardware, devices, data, time, personnel, and software) are prioritized based on their classification, criticality, and business value']` |  |  |
| Ransomware Application | `['An inventory of physical devices should be undertaken, reviewed, and maintained to ensure these devices are not vulnerable to ransomware. It is also beneficial to have a hardware inventory during the recovery phases after a ransomware attack, should a re- installation of applications be necessary.', 'Software inventories may track information such as software name and version, devices where it is currently installed, last patch date, and current known vulnerabilities. This information supports the remediation of vulnerabilities that could be exploited in ransomware attacks.', 'This helps to enumerate what information or processes are at risk, should the attackers move laterally within an environment.', 'This is important for planning communications to partners and possible actions to temporarily disconnect from external systems in response to ransomware events. Identifying these connections will also help organizations plan security control implementation and identify areas where controls may be shared with third parties.', 'This is essential to understanding the true scope and impact of ransomware events – and is important in contingency planning for future ransomware events, emergency response, and recovery actions. It helps operations and incident responders to prioritize resources and supports contingency planning for future ransomware events, emergency response, and recovery actions. If there is an associated industrial control system (ICS), its critical functions should be included in emergency response and recovery actions.']` |  |  |
| CRI Profile v2.0 Diagnostic Statement | `['ID.AM-01.01: The organization maintains a current and complete asset inventory of physical devices, hardware, and information systems.', 'ID.AM-02.01: The organization maintains a current and complete inventory of software platforms, business applications, and other software assets (e.g., virtual machines and virtual network devices).', 'ID.AM-03.01: The organization maintains current maps of network resources, mobile resources, external connections, network-connected third parties, and network data flows.', 'ID.AM-07.01: The organization maintains a current inventory of the data being created, stored, or processed by its information assets and data flow diagrams depicting key internal and external data flows.', 'ID.AM-04.01: Hardware, software, and data assets maintained by or located at suppliers or other third parties are included in asset management inventories and lifecycle management processes as required for effective management and security.']` |  |  |
| CRI Profile Subcategory | `['IDENTIFY / Asset Management / Hardware Inventory', 'IDENTIFY / Asset Management / Software, Services, & Systems Inventory', 'IDENTIFY / Asset Management / Network Communications & Data Flows', 'IDENTIFY / Asset Management / Data & Metadata Inventory', 'IDENTIFY / Asset Management / Supplier Services Inventory']` |  |  |

## Framework: NIST SP 800-53 Rev. 5 - Controls Catalog

**Data Source**: `./Frameworks/sp800-53r5-control-catalog.xlsx`

### Sheet: SP 800-53 Revision 5

| Column Name                           | Example Values                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       | Mapped to (Other Table / Column)                          | Notes                                                                      |                     |     |     |
| ------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------- | -------------------------------------------------------------------------- | ------------------- | --- | --- |
| Control Identifier                    | `['AC-1', 'AC-2', 'AC-2(1)', 'AC-2(2)', 'AC-2(3)']`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |                                                           |                                                                            |                     |     |     |
| Control (or Control Enhancement) Name | `['Policy and Procedures', 'Account Management', 'Account Management                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 | Automated System Account Management', 'Account Management | Automated Temporary and Emergency Account Management', 'Account Management | Disable Accounts']` |     |     |
| Control Text                          | `['a. Develop, document, and disseminate to [Assignment: organization-defined personnel or roles]: 1. [Selection (one or more): Organization-level; Mission/business process-level; System-level] access control policy that: (a) Addresses purpose, scope, roles, responsibilities, management commitment, coordination among organizational entities, and compliance; and (b) Is consistent with applicable laws, executive orders, directives, regulations, policies, standards, and guidelines; and 2. Procedures to facilitate the implementation of the access control policy and the associated access controls; b. Designate an [Assignment: organization-defined official] to manage the development, documentation, and dissemination of the access control policy and procedures; and c. Review and update the current access control: 1. Policy [Assignment: organization-defined frequency] and following [Assignment: organization-defined events]; and 2. Procedures [Assignment: organization-defined frequency] and following [Assignment: organization-defined events].', 'a. Define and document the types of accounts allowed and specifically prohibited for use within the system; b. Assign account managers; c. Require [Assignment: organization-defined prerequisites and criteria] for group and role membership; d. Specify: 1. Authorized users of the system; 2. Group and role membership; and 3. Access authorizations (i.e., privileges) and [Assignment: organization-defined attributes (as required)] for each account; e. Require approvals by [Assignment: organization-defined personnel or roles] for requests to create accounts; f. Create, enable, modify, disable, and remove accounts in accordance with [Assignment: organization-defined policy, procedures, prerequisites, and criteria]; g. Monitor the use of accounts; h. Notify account managers and [Assignment: organization-defined personnel or roles] within: 1. [Assignment: organization-defined time period] when accounts are no longer required; 2. [Assignment: organization-defined time period] when users are terminated or transferred; and 3. [Assignment: organization-defined time period] when system usage or need-to-know changes for an individual; i. Authorize access to the system based on: 1. A valid access authorization; 2. Intended system usage; and 3. [Assignment: organization-defined attributes (as required)]; j. Review accounts for compliance with account management requirements [Assignment: organization-defined frequency]; k. Establish and implement a process for changing shared or group account authenticators (if deployed) when individuals are removed from the group; and l. Align account management processes with personnel termination and transfer processes.', 'Support the management of system accounts using [Assignment: organization-defined automated mechanisms].', 'Automatically [Selection: remove; disable] temporary and emergency accounts after [Assignment: organization-defined time period for each type of account].', 'Disable accounts within [Assignment: organization-defined time period] when the accounts:  (a) Have expired; (b) Are no longer associated with a user or individual; (c) Are in violation of organizational policy; or (d) Have been inactive for [Assignment: organization-defined time period].']`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |                                                           |                                                                            |                     |     |     |
| Discussion                            | `['Access control policy and procedures address the controls in the AC family that are implemented within systems and organizations. The risk management strategy is an important factor in establishing such policies and procedures. Policies and procedures contribute to security and privacy assurance. Therefore, it is important that security and privacy programs collaborate on the development of access control policy and procedures. Security and privacy program policies and procedures at the organization level are preferable, in general, and may obviate the need for mission- or system-specific policies and procedures. The policy can be included as part of the general security and privacy policy or be represented by multiple policies reflecting the complex nature of organizations. Procedures can be established for security and privacy programs, for mission or business processes, and for systems, if needed. Procedures describe how the policies or controls are implemented and can be directed at the individual or role that is the object of the procedure. Procedures can be documented in system security and privacy plans or in one or more separate documents. Events that may precipitate an update to access control policy and procedures include assessment or audit findings, security incidents or breaches, or changes in laws, executive orders, directives, regulations, policies, standards, and guidelines. Simply restating controls does not constitute an organizational policy or procedure.', 'Examples of system account types include individual, shared, group, system, guest, anonymous, emergency, developer, temporary, and service. Identification of authorized system users and the specification of access privileges reflect the requirements in other controls in the security plan. Users requiring administrative privileges on system accounts receive additional scrutiny by organizational personnel responsible for approving such accounts and privileged access, including system owner, mission or business owner, senior agency information security officer, or senior agency official for privacy. Types of accounts that organizations may wish to prohibit due to increased risk include shared, group, emergency, anonymous, temporary, and guest accounts. Where access involves personally identifiable information, security programs collaborate with the senior agency official for privacy to establish the specific conditions for group and role membership; specify authorized users, group and role membership, and access authorizations for each account; and create, adjust, or remove system accounts in accordance with organizational policies. Policies can include such information as account expiration dates or other factors that trigger the disabling of accounts. Organizations may choose to define access privileges or other attributes by account, type of account, or a combination of the two. Examples of other attributes required for authorizing access include restrictions on time of day, day of week, and point of origin. In defining other system account attributes, organizations consider system-related requirements and mission/business requirements. Failure to consider these factors could affect system availability. Temporary and emergency accounts are intended for short-term use. Organizations establish temporary accounts as part of normal account activation procedures when there is a need for short-term accounts without the demand for immediacy in account activation. Organizations establish emergency accounts in response to crisis situations and with the need for rapid account activation. Therefore, emergency account activation may bypass normal account authorization processes. Emergency and temporary accounts are not to be confused with infrequently used accounts, including local logon accounts used for special tasks or when network resources are unavailable (may also be known as accounts of last resort). Such accounts remain available and are not subject to automatic disabling or removal dates. Conditions for disabling or deactivating accounts include when shared/group, emergency, or temporary accounts are no longer required and when individuals are transferred or terminated. Changing shared/group authenticators when members leave the group is intended to ensure that former group members do not retain access to the shared or group account. Some types of system accounts may require specialized training.', 'Automated system account management includes using automated mechanisms to create, enable, modify, disable, and remove accounts; notify account managers when an account is created, enabled, modified, disabled, or removed, or when users are terminated or transferred; monitor system account usage; and report atypical system account usage. Automated mechanisms can include internal system functions and email, telephonic, and text messaging notifications.', 'Management of temporary and emergency accounts includes the removal or disabling of such accounts automatically after a predefined time period rather than at the convenience of the system administrator. Automatic removal or disabling of accounts provides a more consistent implementation.', 'Disabling expired, inactive, or otherwise anomalous accounts supports the concepts of least privilege and least functionality which reduce the attack surface of the system.']` |                                                           |                                                                            |                     |     |     |
| Related Controls                      | `['IA-1, PM-9, PM-24, PS-8, SI-12 .', 'AC-3, AC-5, AC-6, AC-17, AC-18, AC-20, AC-24, AU-2, AU-12, CM-5, IA-2, IA-4, IA-5, IA-8, MA-3, MA-5, PE-2, PL-4, PS-2, PS-4, PS-5, PS-7, PT-2, PT-3, SC-7, SC-12, SC-13, SC-37.', 'None.', 'AU-2, AU-6.', 'AC-11.']`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |                                                           |                                                                            |                     |     |     |
