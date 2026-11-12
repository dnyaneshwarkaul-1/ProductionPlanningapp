import numpy as np
import pandas as pd
import os
from dateutil.relativedelta import relativedelta
import calendar
import datetime
import timedmd_df 
import warnings
warnings.filterwarnings("ignore")

def subtractNumbers(a, b):
    print("Difference is ", a-b)

# class data_prep():
def run(self, dmd, prod_sourcing, t_MPS_plan, t_DIFC_Target, t_Inv_raw, t_demand_export):
    aa = time.time()
    ##### Excel file reading- Excel file names:
    path = r"C:\Users\KRB0721\OneDrive - MDLZ\Desktop\RCCP-1\RCCP_Input\20230106"
    dmd = "\\Demand" 
    prod_sourcing = "\\Prod_Sourcing" # many files
    t_avail_days = "\\Avail_days"
    t_MPS_plan = "\\t_MPS_plan"
    t_DIFC_Target = "\\t_DIFC_Target"
    t_Inv_raw = "\\t_Inv_raw"
    ###
    SKU_master = pd.read_excel(path + prod_sourcing+".xlsx", header = 0, sheet_name= "SKU_master") #SKU Master
    storage_loc = pd.read_excel(path + prod_sourcing+".xlsx", header = 0, sheet_name= "storage_loc") # Storage location
    plant = ['CN37 ', 'CN71 ', 'CN79 '] # Warehosue plant used in Inv_raw file
    co_pack_bom_mstr = pd.read_excel(path + prod_sourcing +".xlsx", header = 0, sheet_name= "co_pack") # Co-pack_ BOM
    sku_line = pd.read_excel(path + prod_sourcing+".xlsx",sheet_name="SKU_Line",converters={"SKU":str})
    oven_throughput = pd.read_excel(path + prod_sourcing+".xlsx",sheet_name="oven_throughput")
    transportation_cost = pd.read_excel(path + prod_sourcing+".xlsx",sheet_name="transportation_cost")
    sub_brand = pd.read_excel(path + prod_sourcing+".xlsx",sheet_name="sub_brand")
    grp_line_flvr = pd.read_excel(path + prod_sourcing+".xlsx",sheet_name="Group line flavor matrix")
    group_pack_ratio = pd.read_excel(path + prod_sourcing+".xlsx",sheet_name="Group_pack_ratio",converters={"SKU":str})
    group = pd.read_excel(path + prod_sourcing+".xlsx",sheet_name="Group",converters={"SKU":str})
    RCCP_plant = pd.read_excel(path + t_avail_days+".xlsx",sheet_name="avail_days") # Monthly # of days available @plant-line
    dmd_fcst= pd.read_excel(path + dmd+".xlsx",index_col=0, header = 0, sheet_name= "Demand").reset_index() # demand file , all RDc together from SAP -APO
    # difc_file_path = path + t_DIFC_Target + ".xlsx" # DIFC - Target
    DIFC_target = pd.read_excel(path + t_DIFC_Target+".xlsx", header = 0, sheet_name= "DIFC_target")
    mps_file = pd.read_excel(path + t_MPS_plan+".xlsx", header = 0, sheet_name= "MPS") # MPS
    inv_raw = pd.read_excel(path + t_Inv_raw+".xlsx", header = 0, sheet_name= "Inv_raw") # MPS
    num_shift_day =3
    num_of_hrs_day =8
    file_date = datetime.datetime(year = 2022, month=9+1, day=1) # to cal MPS, proj_land_inv ---> need to dynamic@DK
    c = time.time()
    #Data type of Material, SKU, Component
    inv_raw['Material'] = inv_raw['Material'].astype(str)
    SKU_master['SKU'] = SKU_master['SKU'].astype(str)
    sku_line['SKU'] = sku_line['SKU'].astype(str)
    co_pack_bom_mstr[['Material number','Component']]= co_pack_bom_mstr[['Material number','Component']].astype(str)
    dmd_fcst['Material'] = dmd_fcst['Material'].astype(str)
    group['SKU'] = group['SKU'].astype(str)
    ### Basic Data Checkpoints
    #Brand, Flavour capitalization
    dmd_fcst['RDC'] = dmd_fcst['RDC'].str.upper()
    SKU_master[['Brand', 'Flavour']] = SKU_master[['Brand', 'Flavour']].astype(str).apply(lambda col: col.str.upper())
    sku_line[['Brand', 'Flavour','Plant','Line']] = sku_line[['Brand', 'Flavour','Plant','Line']].astype(str).apply(lambda col: col.str.upper())
    oven_throughput[['Brand', 'Flavour','Plant','Line']] = oven_throughput[['Brand', 'Flavour','Plant','Line']].astype(str).apply(lambda col: col.str.upper())
    sub_brand[['Sub-Brand-1','Sub-Brand-2']] = sub_brand[['Sub-Brand-1','Sub-Brand-2']].astype(str).apply(lambda col: col.str.upper())
    transportation_cost[['Sourcing_DC','Destination_DC']] = transportation_cost[['Sourcing_DC','Destination_DC']].astype(str).apply(lambda col: col.str.upper())
    group_pack_ratio[['Brand', 'Flavour','Plant','Line','Group_Name']] = group_pack_ratio[['Brand', 'Flavour','Plant','Line','Group_Name']]                                                                                    .astype(str).apply(lambda col: col.str.upper())
    group['Group_Name'] = group['Group_Name'].str.upper()
    grp_line_flvr[['Group','Plant','Line']] = grp_line_flvr[['Group','Plant','Line']].astype(str).apply(lambda col: col.str.upper())
    RCCP_plant[['Plant','Line']] = RCCP_plant[['Plant','Line']].astype(str).apply(lambda col: col.str.upper())

    #Oven throughput vs SKU line check
    oven_throughput = sku_line[['Brand','Flavour','Plant','Line']].drop_duplicates().merge(oven_throughput,on = ['Brand','Flavour','Plant','Line'],how='left')

    #Retaining RCCP_plan or avail_days field names only
    Field_name = ['Calendar Days', 'Legal Non Operating Time', 'No demand',
        'Planned Maintenance', 'Planned Autonomous Maintenance',
        'Sanitation', 'Changeovers', 'Planned Stops',
        'Consumables replacement', 'Start and Finish Production',
        'Unplanned Stops', 'Max. available capacity (days)', 'weighted throughput',
        'Required capacity (days)', 'Capacity gap (Ava - Req)',
        'Hours used', 'LU % (hrs used/max)','OEE']
    RCCP_plant = RCCP_plant[RCCP_plant['Field_name'].isin(Field_name)]

    dmd_fcst = dmd_fcst.drop(columns =['Forecast Element', 'FCST RELEASE WEEK','DC Name','Description','Calender Period/Year'])

    # Adding Group to SKU-line , oven-throughput, group_pack_ratio, group
    sku_line_group = sku_line.merge(grp_line_flvr[['Plant','Line','Group']],on=['Plant','Line'],how='left')
    #sku_line_group['Group'] = sku_line_group['Group'].replace(np.nan, "OREO") # need to avoid @ DK

    oven_throughput_group = oven_throughput.merge(grp_line_flvr[['Plant','Line','Group']],on=['Plant','Line'],how='left')

    group_pack_ratio_1 = group_pack_ratio.merge(sku_line_group[['Group','Brand','Flavour','Plant','Line']].drop_duplicates(),on=['Brand','Flavour','Plant','Line'],how='left')

    group_1 = pd.merge(group,sku_line_group[['SKU','Group']].drop_duplicates(),on='SKU',how='left')

    oven_throughput_group['Plant_Line'] = oven_throughput_group['Plant'] + "_" + oven_throughput_group['Line']
    oven_throughput_group['Max run rate_tons per hour'] = oven_throughput_group['Max run rate_tons per day'] / 24
    sku_line_group['Plant_Line'] = sku_line_group['Plant'] + "_" + sku_line_group['Line']
    ##00 transportation data prep for model

    transportation_cost_SKU_Plant_RDC = pd.merge(sku_line_group[['SKU','Plant','Line']].drop_duplicates(),transportation_cost[['Sourcing_DC','Destination_DC','Cost RMB / m³']],                                                    left_on='Plant',right_on='Sourcing_DC',how='left')
    transportation_cost_SKU_Plant_RDC = transportation_cost_SKU_Plant_RDC.merge(SKU_master[['SKU','tons/m3']],on='SKU')
    transportation_cost_SKU_Plant_RDC['Cost RMB/ton'] = transportation_cost_SKU_Plant_RDC['Cost RMB / m³']                                                                                /transportation_cost_SKU_Plant_RDC['tons/m3']
    ## 1. MPS data prepration
    mps = mps_file.rename(columns = {'Plant':'RDC'})
    # group by SKU, RDC 
    mps_df = mps.groupby(['SKU','RDC']).agg({'Current': 'sum','Current+1': 'sum', 'Current+2': 'sum'}).reset_index()
    # update columns names, current = file_date_production 
    mps_month =3
    mps_col_name = []
    for i in range(mps_month):
        mps_col_name.append( (file_date + relativedelta(months= + i)).strftime('%Y-%m-%d') + '-production')
    mps_df.columns = ['SKU','RDC'] +  mps_col_name
    ## 2. RCCP data prep
    RCCP_plan = RCCP_plant[RCCP_plant['Field_name'].isin(['Max. available capacity (days)','weighted throughput'])]
    RCCP_plan = RCCP_plan.set_index(['Plant', 'Line', 'Field_name']).stack().                                reset_index().rename(columns={'level_3':'Year-Month', 0:'Monthly_Days_Capacity'})
    RCCP_plan = pd.pivot_table(RCCP_plan, index=['Plant','Line','Year-Month'], columns=['Field_name'] , aggfunc=np.sum)
    RCCP_plan.columns = RCCP_plan.columns.get_level_values(1)
    RCCP_plan = RCCP_plan.reset_index()
    #Calculate prod_cap & prod_cap_add
    RCCP_plan['prod_cap'] = (RCCP_plan['Max. available capacity (days)']+0)*RCCP_plan['weighted throughput']
    RCCP_plan['prod_cap_add'] = (RCCP_plan['Max. available capacity (days)']+0.5)*RCCP_plan['weighted throughput']
    #Add Quarter
    RCCP_plan['quarter'] = pd.PeriodIndex(RCCP_plan['Year-Month'], freq='Q')
    RCCP_plan['quarter_month_num'] = RCCP_plan.groupby(['Plant','Line','quarter'])['Year-Month'].cumcount()+1
    #Add Group for Plant & Line
    RCCP_plan_1 = RCCP_plan.merge(sku_line_group[['Plant','Line','Group']].drop_duplicates(),on=['Plant','Line'],how='left')

    RCCP_plan_1['Monthly_cap_hrs']=RCCP_plan_1['Max. available capacity (days)'] * num_shift_day * num_of_hrs_day
    ## 3. On- Hand Inv data prep
    inv_raw = inv_raw.merge(SKU_master, left_on = 'Material', right_on = 'SKU', how = 'left')
    inv_raw = inv_raw.merge(storage_loc[['storage_loc','value']], on = 'storage_loc',  how = 'left')
    inv_raw['Intransit'] = inv_raw[['Plant','In_transit_stock_qty']].apply(lambda x: x['In_transit_stock_qty'] if x['Plant'] not in plant else 0, axis=1)

    inv_raw['num_box_stock'] = inv_raw['TTL'] - inv_raw['Intransit']
    inv_raw['avail_stock_qty'] = (inv_raw['Unrestricted_use_stock_qty'] + inv_raw['In_transit_stock_qty'] - 
                        inv_raw['Intransit']) * inv_raw['value'] # values is for storage is vailabvle then 1 
    inv_raw['qlty_Insp'] = inv_raw['quality_inspection_qty'] * inv_raw['value']
    inv_raw['net_weight_ton'] = inv_raw['netweight'] * inv_raw['avail_stock_qty']
    inv_raw['Net_weight_QI'] = inv_raw['qlty_Insp'] * inv_raw['netweight']/1000
    inv_raw['Net_wt_incl_quality_prob_Aging_inv'] = inv_raw['num_box_stock'] * inv_raw['netweight']/1000
    inv_raw_difc = inv_raw.copy() 
    ## 4. Demand data prep
    dmd_df = dmd_fcst.set_index(['Material', 'RDC']).stack().reset_index().rename(columns={'level_2':'Year-Month', 0:'Value','Material':'SKU'})
    ##### Demand - get demand in tons by SKU, Month, RDC
    dmd_df = dmd_df[dmd_df['Year-Month'] >= file_date.strftime('%Y-%m-%d')] # Update to file date
    # Generate first day of each month for later calculation
    dmd_df['Date'] = pd.to_datetime(dmd_df['Year-Month'].dt.year.astype(str) + '-'+ dmd_df['Year-Month'].dt.month.astype(str) + '-' + str(1)) #Need to avoid @DK
    dmd_df = dmd_df.merge(SKU_master[['SKU','Brand','Flavour']],left_on='SKU', right_on ='SKU', how='left')
    #dmd_df_national = dmd_df.copy()
    dmd_df_as_is = dmd_df.copy()
    ## 5. OREO - Base Cake & SDW Demand Conversion
    sub_brand['Ratio'] = sub_brand['Std_weight_1']/sub_brand['Std_weight_2']

    dmd_df['Flavour'] = dmd_df['Flavour'].astype(str)
    dmd_df['Sub_brand'] = dmd_df['Brand'] + "-" + dmd_df['Flavour']  #Key- Check with @Vic --@DK

    dmd_df = dmd_df.merge(sub_brand[['Sub-Brand-1','Sub-Brand-2','Ratio']],\
                        left_on='Sub_brand',right_on='Sub-Brand-1',how='left') #Merge dmd_df & sub_brand

    dmd_df['Ratio'] = dmd_df['Ratio'].fillna(1)
    dmd_df['Value'] = dmd_df['Value']/dmd_df['Ratio']
    dmd_df['Flavour'] = np.where(dmd_df['Ratio'] < 1, dmd_df['Sub-Brand-2'].str.rsplit('-').str[-1], dmd_df['Flavour'])
    #base SKU for future (OREO - to multiply by ratio)
    dmd_df_base = dmd_df[~pd.isnull(dmd_df['Sub-Brand-1'])]
    dmd_df_base = dmd_df_base[['SKU','Brand','Flavour','Sub-Brand-1','Sub-Brand-2','Ratio']].drop_duplicates()
    #dmd_df_base = dmd_df_base['Material'].unique()
    dmd_df = dmd_df.drop(columns =['Sub-Brand-1','Sub_brand','Sub-Brand-2','Ratio'])

    ## 6. co-packing data prep
    #Copacking Step-1
    co_pack_bom_mstr = co_pack_bom_mstr.merge(SKU_master[['SKU', 'netweight','Demand_type','Co_pack', 'tons/m3']], 
                                                left_on = 'Material number', right_on = 'SKU', how = 'left')
    co_pack_bom_mstr['netweight_qty'] = co_pack_bom_mstr['Quantity'] * co_pack_bom_mstr['netweight']

    co_pack_bom_mstr_1 = co_pack_bom_mstr.groupby(['SKU']).agg({'netweight_qty': 'sum'}).reset_index()
    co_pack_bom_mstr = co_pack_bom_mstr.merge(co_pack_bom_mstr_1, on = 'SKU', how = 'left')
    co_pack_bom_mstr['netweight_qty_ratio'] = co_pack_bom_mstr['netweight_qty_x']/ co_pack_bom_mstr['netweight_qty_y'] 
    #co_pack_bom_mstr['Component'] = co_pack_bom_mstr['Component'].astype(str)

    co_pack_bom_mstr = co_pack_bom_mstr.merge(sku_line[['SKU','Brand','Flavour']].drop_duplicates(), left_on='Component',right_on='SKU',how='left')

    co_pack_bom_mstr = co_pack_bom_mstr.drop(columns =['Material description','BOM component'])
    co_pack_bom_mstr_1 = co_pack_bom_mstr[['Material number','Component','netweight_qty_ratio']].drop_duplicates()

    # Co-packing Step-2
    co_pack_dmd_1 = dmd_df[[ 'SKU','RDC', 'Year-Month', 'Value',  'Date', 'Brand', 'Flavour']].merge(co_pack_bom_mstr_1, left_on = 'SKU', right_on = 'Material number',how = 'inner')
    co_pack_dmd_1['Value'] = co_pack_dmd_1['Value'] * co_pack_dmd_1['netweight_qty_ratio']

    co_pack_dmd_1_sku = co_pack_dmd_1['SKU'].unique()
    co_pack_dmd_1= co_pack_dmd_1[['Component', 'Brand', 'Flavour','RDC', 'Year-Month', 'Value', 'Date', 'SKU']]

    #Duplicate record check
    dup = co_pack_dmd_1[co_pack_dmd_1.duplicated()]

    co_pack_dmd_1['Type_pack'] = 'Co-pack'
    co_pack_dmd_1_component = co_pack_dmd_1['Component'].unique()

    normal_pack_dmd = dmd_df[~dmd_df['SKU'].isin(co_pack_dmd_1_sku)]
    normal_pack_dmd['Type_pack'] = 'Normal_pack'
    normal_pack_dmd['Type_pack'] = np.where(normal_pack_dmd['SKU'].isin(co_pack_dmd_1_component), "Co-pack_comp", normal_pack_dmd['Type_pack'])
    # Co-packing Step-3
    dmd_copack_nopack = co_pack_dmd_1.append(normal_pack_dmd)
    dmd_copack_nopack['Component']= dmd_copack_nopack['Component'].fillna(dmd_copack_nopack['SKU'])

    #Component part of 2 or more Material's 
    dup1 = dmd_copack_nopack[dmd_copack_nopack[['Component','Brand','Flavour','RDC','Year-Month','Type_pack','Date']].duplicated()]

    #Solution ratio
    #comp_sku_ratio for transportation solution
    #comp_sku_prod for production solution
    sol_ratio = dmd_copack_nopack.copy()
    comp_rdc_month = sol_ratio.groupby(['Component','RDC','Year-Month']).agg({'Value': 'sum'}).rename(columns={'Value':'Total'}).reset_index()
    comp_sku_rdc_month = sol_ratio.groupby(['Component','SKU','RDC','Year-Month']).agg({'Value': 'sum'}).reset_index()
    comp_sku_ratio = comp_sku_rdc_month.merge(comp_rdc_month, on=['Component','RDC','Year-Month'],how='left')
    comp_sku_ratio['Ratio'] = comp_sku_ratio['Value']/comp_sku_ratio['Total']
    comp_sku_ratio['Ratio'] = comp_sku_ratio['Ratio'].fillna(1)

    comp_sku_prod = comp_sku_ratio.groupby(['Component','SKU','Year-Month']).agg({'Value': 'sum'}).reset_index()
    comp_sku_prod['Total'] = comp_sku_prod.groupby(['Component','Year-Month'])['Value'].transform('sum')
    comp_sku_prod['Ratio'] = comp_sku_prod['Value'] / comp_sku_prod['Total']
    comp_sku_prod['Ratio'] = comp_sku_prod['Ratio'].fillna(1)

    #Drop Co-pack SKU Column & rename Component to SKU
    dmd_copack_nopack = dmd_copack_nopack.drop(columns =['SKU'])
    dmd_copack_nopack = dmd_copack_nopack.rename(columns={'Component':'SKU'})
    #sku_line['SKU']  = sku_line['SKU'].astype(str)
    #dmd_copack_nopack['SKU']  = dmd_copack_nopack['SKU'].astype(str)
    dmd_copack_nopack = dmd_copack_nopack[['SKU','RDC','Year-Month','Date','Value']].merge(sku_line[['SKU','Brand','Flavour']].drop_duplicates(),                                    left_on='SKU',right_on='SKU',how='left')
    dmd_copack_nopack = dmd_copack_nopack.groupby(['SKU','Brand','Flavour','RDC','Year-Month','Date']).agg({'Value': 'sum'}).reset_index()
    #Check index duplicates
    t1 = dmd_copack_nopack[dmd_copack_nopack[['SKU','RDC','Year-Month']].duplicated()]
    t2 = t1[['SKU','RDC','Year-Month']].drop_duplicates()

    ## Need to calculate co-pack vs nomalpack components % contribution as need for prod_solution conversion fair sahre distrubiution
    dmd_copack_nopack_1 = dmd_copack_nopack.copy()
    dmd_difc_proj = dmd_copack_nopack.copy()
    # -------------- Demand Preparation Function --------------
    ##### 5. Demand - get demand in tons by SKU, Month, RDC
    def process_dmd(dmd_dy, SKU_master, file_date, logic_version=1):
        dmd_df_national = dmd_dy.copy()

        # ---------------- Take days depend on file_date- variable and logic version ----------------#
        if logic_version == 1: # take demand from current month
            dmd_df_national = dmd_df_national[dmd_df_national['Year-Month'] >= file_date.strftime('%Y-%m-%d')] 
        else: # loic_version ==2, take from prev month
            file_date_prev = (file_date + relativedelta(months = -1))
            dmd_df_national = dmd_df_national[dmd_df_national['Year-Month'] >= file_date_prev.strftime('%Y-%m-%d')] 

        # Generate first day of each month for later calculation
        dmd_df_national['Date'] = pd.to_datetime(dmd_df_national['Year-Month'].dt.year.astype(str) + '-' + dmd_df_national['Year-Month'].dt.month.astype(str) + '-' + str(1))
        dmd_df_national['Date'] = dmd_df_national['Date'].apply(lambda x: x.strftime('%Y-%m-%d'))
        
        # Unstack dmd by month
        dmd_df_by_month = dmd_df_national[['SKU','RDC','Value','Date']].set_index(['SKU','RDC','Date']).unstack().reset_index()
        # Rename columns
        obj_cols = [f'{a}' for a, b in dmd_df_by_month.columns if a != 'Value']
        value_cols = [f'{str(b)}' + '-demand' for a, b in dmd_df_by_month.columns if a == 'Value']
        dmd_df_by_month.columns = obj_cols + value_cols

        # Merge sku master to get flavor for later DIFC target merge
        dmd_df_by_month = dmd_df_by_month.merge(SKU_master[['SKU','Brand','Flavour']].drop_duplicates(),on='SKU', how='left')

        return dmd_df_by_month
    # -------------- DIFC Preparation Function --------------
    #### Inventory Target - get DIFC target days by Flavour, Brand, RDC and Month
    # * fill na with 20 days
    def process_difc(DIFC_target):
    
        DIFC_target = DIFC_target.rename(columns={'Location':'RDC'}).drop(columns=['Description'])
        DIFC_target_by_month = DIFC_target.set_index(['SKU','RDC']).stack().reset_index().rename(columns={'level_2':'Date',0:'DIFC_target_days'}).drop_duplicates()

        DIFC_target_by_month['Date'] = DIFC_target_by_month['Date'].apply(lambda x: x.strftime('%Y-%m-%d'))

        # take date after 2022-07-01 and remove null lines
        DIFC_target_by_month = DIFC_target_by_month[DIFC_target_by_month['Date'] >= file_date.strftime('%Y-%m-%d')].dropna(how='any').drop_duplicates(['SKU','RDC','Date']) # null flavor

        # unstack by month and fill na with 20 days
        DIFC_target_by_month = DIFC_target_by_month.set_index(['SKU','RDC','Date']).unstack().reset_index().fillna(20)
        ## print the link of SKU, RDC , month ----> NA 

        # Rename columns
        obj_cols = [f'{a}' for a, b in DIFC_target_by_month.columns if a != 'DIFC_target_days']
        value_cols = [f'{str(b)}' + '-DIFC-Days' for a, b in DIFC_target_by_month.columns if a == 'DIFC_target_days']
        DIFC_target_by_month.columns = obj_cols + value_cols

        return DIFC_target_by_month
    #  Inventory Preparation Function --------------
    #### Inventory (2022-06 June End stock) - get available stocks by SKU, Plant, Month 
    def process_inv(inv_df, file_date_prev):
        inv_stock = inv_df.copy()[['SKU','Plant','net_weight_ton']].fillna(0).rename(columns={'Plant':'RDC','net_weight_ton': file_date_prev.strftime('%Y-%m-%d')+'-avail_stock_in_tons'}).drop_duplicates()
        inv_stock = inv_stock.applymap((lambda x:"".join(x.split()) if type(x) is str else x))
        inv_stock = inv_stock.drop_duplicates(['SKU','RDC'])  # !!!-------------- check for duplicates with DK and Vic later --------------!!!
        return inv_stock
    ### Join dataframes - logic 1 has 3 dfs: dmd, inv and difc; logic 2 has 4 dfs dmd, inv, difc and mps
    # 1. Join Demand and Invetory target by SKU, RDC and year-month, fillna DIFC target days with *20 
    # 2. Then join inv stock to get avail_stock_qty for LAST month by SKU, year-month and RDC 
    def join_dmd_inv_difc_mps(dmd_df, inv_df, difc_df, mps_df, fillna_with=1.21):

        # Join demand and difc target by SKU and RDC
        dmd_difc = dmd_df.copy().merge(difc_df.copy(), on=['SKU','RDC'], how='left')

        # DIFC days Fill na with 20
        for i in dmd_difc.columns:
            if 'DIFC' in i :
                dmd_difc[i] = dmd_difc[i].fillna(20)

        # merge to get 2022-06 End stock
        dmd_difc_stock = dmd_difc.merge(inv_df.copy(), on =['SKU','RDC'], how='left').fillna(0)

        # merge MPS to dmd_difc_stock by SKU and RDC, fill na with input fillna_with default 1.21
        dmd_difc_stock = dmd_difc_stock.merge(mps_df.copy(), on=['SKU','RDC'], how='left').fillna(fillna_with)
        return dmd_difc_stock
    #
    def join_dmd_inv_difc(dmd_df, inv_df, difc_df, fillna_with=0):

        # Join demand and difc target by SKU and RDC
        dmd_difc = dmd_df.copy().merge(difc_df.copy(), on=['SKU','RDC'], how='left')

        # DIFC days Fill na with 20
        for i in dmd_difc.columns:
            if 'DIFC' in i :
                dmd_difc[i] = dmd_difc[i].fillna(20)

        # merge to get 2022-06 End stock
        dmd_difc_stock = dmd_difc.merge(inv_df.copy(), on =['SKU','RDC'], how='left').fillna(fillna_with)

        return dmd_difc_stock

    # -------- Function: generate calendar days df --------
    def generate_calendar_df(dmd_col):
        date_list = []
        month_day_list = []

        for i in dmd_col:
            if 'demand' in i :
                iday = pd.to_datetime(i[0:10])
                var = str(iday.strftime('%Y-%m-%d')) + '-month-days'
                date_list.append(iday.strftime('%Y-%m-%d'))
                month_day_list.append(calendar.monthrange(iday.year, iday.month)[1])

        calendar_df = pd.DataFrame()
        calendar_df['Date']= date_list
        calendar_df['Month_day'] = month_day_list
        return calendar_df
    # Function: calculate cover month and remain days (DIFC - covered months' calendar days)
    #### Calculate cover month and remain days (DIFC - covered months' calendar days)
    def cal_cover_month_remain_days(calendar_df, dmd_difc_df, dmd_col):
        
        dmd_difc_stock = dmd_difc_df.copy()
        for i in dmd_col:
            iday = i[0:10]
            var_cover = str(iday) + '-cover-month'
            var_remain = str(iday) + '-remain-days'
            var_difc = str(iday) + '-DIFC-Days'
            cover_month_list = []
            remain_day_list = []

            for difc1 in zip(dmd_difc_stock[var_difc]):
                calendar_df_temp = calendar_df.loc[calendar_df['Date']>= iday] # update calendar_df
                calendar_df_temp = calendar_df_temp.sort_values('Date') # sort by date ascending
                calendar_df_temp['DIFC'] = difc1[0]
                calendar_df_temp['Month_day_cum'] = calendar_df_temp['Month_day'].cumsum()
                calendar_df_temp['Cover'] = calendar_df_temp['DIFC'] - calendar_df_temp['Month_day_cum']

                # calculate how many month can be cover
                cover_month = calendar_df_temp.shape[0] - calendar_df_temp[calendar_df_temp['Cover']<0].shape[0] 
                # calculate remain days after DIFC days - calendar month days can be covered
                if cover_month > 0 :
                    remain_day = min(list(calendar_df_temp[calendar_df_temp['Cover']>=0]['Cover']))
                else:  
                    remain_day = 0

                cover_month_list.append(cover_month)
                remain_day_list.append(remain_day)

            dmd_difc_stock[var_cover] = cover_month_list
            dmd_difc_stock[var_remain] = remain_day_list
        
        return dmd_difc_stock
    # -------Function: append for following month ------------------------
    ### Append 3 months demand by latest month, eg: 2023-04 ~ 2023-06 demand not available, use 2023-03 demand instead
    def generate_copy_append_3_month(dmd_difc_df, dmd_cols, demand_following_month=3):
        dmd_difc_stock_copy = dmd_difc_df.copy()

        # generate 3 month for folloing 3 month
        # get demand columns
        dmd_cols = [f'{a}' for a in dmd_difc_stock.columns if a.find('demand') > 0]
        
        # get latest file_date
        latest_file_date = pd.to_datetime(max(dmd_cols)[0:10])
        latest_dmd_var = latest_file_date.strftime('%Y-%m-%d') + '-demand'

        # # !!! ---------- update following 3 month demand latest month's demand --------- !!!
        # Generate default month columns after latest date
        for i in range(demand_following_month):
            iday = latest_file_date + relativedelta(months = +i+1)
            var = iday.strftime('%Y-%m-%d') + '-demand'

            # set difc days to 20 
            dmd_difc_stock_copy[var] = dmd_difc_stock[latest_dmd_var]

        return dmd_difc_stock_copy
    ###### !!! ---------- Calculate end stock for each month ---------- !!!
    # # Function: End stock calculation
    # * For file_date, file_date+1 and file_date+2 end_stock = prev_end_stock +　prev_demand - file_date_production
    # * For the rest months, apply logic 1 (consider following months' demand only)
    def cal_endstock(dmd_difc_df, dmd_col, logic_2_date, logic_version= 1):
        
        dmd_difc_stock = dmd_difc_df.copy()
        for i in dmd_col:
            iday = pd.to_datetime(i[0:10])
            m1_days = calendar.monthrange(iday.year, iday.month)[1] #current month calendar days

            iday = iday.strftime('%Y-%m-%d') 
            var_cover = str(iday) + '-cover-month'
            var_remain = str(iday) + '-remain-days'
            var_dmd = str(iday) + '-demand'
            var_difc = str(iday) + '-DIFC-Days'
            var_end = str(iday) + '-end-stock'

            # list to hold result
            end_stock = []

            for ix, cover_month, remain_day, difc_m1 in zip(dmd_difc_stock.index, dmd_difc_stock[var_cover], dmd_difc_stock[var_remain], dmd_difc_stock[var_difc]):

                # !!! ---- update: if date is file_date, file_date+1 or file_date+2: end_stock = max(prev_end_stock +　prev_demand - file_date_production, 0)
                # CHECK LOGIC 1 OR LOGIC 2
                # logic 2 - for nearing 3 months
                if (iday in logic_2_date) and (logic_version == 2) :
                    # get dmd for previous month
                    var_dmd_m0 = (pd.to_datetime(iday) + relativedelta(months = -1)).strftime('%Y-%m-%d') + '-demand'
                    dmd_m0 = float(dmd_difc_stock_copy[dmd_difc_stock_copy.index == ix][var_dmd_m0])

                    # get end_stock for previous month
                    var_end_stock_m0 = (pd.to_datetime(iday) + relativedelta(months = -1)).strftime('%Y-%m-%d') + '-end-stock'
                    end_stock_m0 = float(dmd_difc_stock[dmd_difc_stock.index == ix][var_end_stock_m0])

                    # get production for this month
                    var_prod_m1 = str(iday) + '-production'
                    prod_m1 = float(dmd_difc_stock_copy[dmd_difc_stock_copy.index == ix][var_prod_m1])
                    endstock = max(end_stock_m0 + dmd_m0 - prod_m1, 0)
                    end_stock.append(endstock)

                # logic 1 / logic 2 for months after nearing 3 months
                else: 
                    # CHECK DIFC W/O current month's calendar days
                    # DIFC <= this month's calendar days
                    if cover_month <=1 and remain_day == 0: 
                        # get demand for next month
                        var_dmd_m2 = (pd.to_datetime(iday) + relativedelta(months = +1)).strftime('%Y-%m-%d') + '-demand'
                        dmd_m2 = float(dmd_difc_stock_copy[dmd_difc_stock_copy.index == ix][var_dmd_m2])

                        # M1_end_stock = M2_demand / M1_month_days * M1_DIFC_target
                        endstock = dmd_m2/ m1_days * difc_m1
                        end_stock.append(endstock)

                    # DIFC > this month's calendar days
                    else:
                        month_list = []
                        cor_demand_list = []

                        # get following from M2 ~ M_cover+1
                        for num in range(cover_month): 
                            month_list.append((pd.to_datetime(iday) + relativedelta(months = +num+1)).strftime('%Y-%m-%d') + '-demand')

                        # get demand from M2 ~ M_cover
                        for dmd_month in month_list:
                            cor_demand_list.append(float(dmd_difc_stock_copy[dmd_difc_stock_copy.index == ix][dmd_month]))

                        iday_end = pd.to_datetime(iday) + relativedelta(months = +cover_month+1)
                        end_days = calendar.monthrange(iday_end.year, iday_end.month)[1] #current month calendar days
                        var_dmd_end = iday_end.strftime('%Y-%m-%d') + '-demand'
                        dmd_end = float(dmd_difc_stock_copy[dmd_difc_stock_copy.index == ix][var_dmd_end])

                        # calculate M1_stock = M2~M_cover+1 demand + M_cover+2_demand / M_cover+2_month_days * remain_days
                        endstock = sum(cor_demand_list) + dmd_end / end_days * remain_day
                        end_stock.append(endstock)
                    
            dmd_difc_stock[var_end] = end_stock
        return dmd_difc_stock
    # Function: calculate production for logic 2 input logic_2_date 
    ##### Calculate production need M1_prod = M1_Dmd + M1_end_stock - M0_end_stock
    def cal_prod_need(dmd_difc_df,  logic_2_date = []):

        dmd_difc_stock = dmd_difc_df.copy()

        # logic_2_date calculated previously (['2022-07-01', '2022-08-01', '2022-09-01']) nearing 3 month
        dmd_date_list = []
        for i in dmd_col:
            dmd_date_list.append(pd.to_datetime(i[0:10]).strftime('%Y-%m-%d'))

        prod_cal_month_list = sorted(list(set(dmd_date_list)-set(logic_2_date)))
        
        # calculate production need for each month after nearing months - logic_2_date
        for i in prod_cal_month_list:
            iday = pd.to_datetime(i[0:10]).strftime('%Y-%m-%d') 
            
            var_dmd = str(iday) + '-demand'
            var_end = str(iday) + '-end-stock'
            var_prod = str(iday) + '-production-need'

            # list to hold result
            prod_need = []

            for ix, dmd_m1, end_stock_m1 in zip(dmd_difc_stock.index, dmd_difc_stock[var_dmd], dmd_difc_stock[var_end]):
                # get end_stock_M0
                var_end_stock_m0 = (pd.to_datetime(iday) + relativedelta(months = -1)).strftime('%Y-%m-%d') + '-end-stock'
                end_stock_m0 = float(dmd_difc_stock[dmd_difc_stock.index == ix][var_end_stock_m0])
                # if prod < 0 , take 0
                prod = max(dmd_m1 + end_stock_m1 - end_stock_m0, 0)
                prod_need.append(prod)

            dmd_difc_stock[var_prod] = prod_need
            
        return dmd_difc_stock
    ### Calculate production 【Version 1】 - every month from current calcuated follow same logic
    # Take previous month
    file_date_prev = (file_date + relativedelta(months = -1))

    # process demand data
    # version 1: take demand from current month
    # version 2: take demand from previous month
    dmd_df_by_month = process_dmd(dmd_copack_nopack_1, SKU_master, file_date, logic_version = 1)
    inv_stock = process_inv(inv_raw, file_date_prev) # process inventory data
    DIFC_target_by_month = process_difc(DIFC_target) # process difc data

    # join tables
    # version 1: merge only dmd_inv_difc, join_dmd_inv_difc
    # version 2: merge MPS, join_dmd_inv_difc_mps
    #inv_stock['SKU'] = inv_stock['SKU'].astype(str)
    dmd_difc_stock = join_dmd_inv_difc(dmd_df_by_month, inv_stock, DIFC_target_by_month, fillna_with=1.21)
    # dmd_difc_stock = join_dmd_inv_difc_mps(dmd_df_by_month, inv_stock, DIFC_target_by_month, mps_df, fillna_with=1.21)

    # generate demand columns
    dmd_col = [f'{a}' for a in dmd_difc_stock.columns if a.find('demand')>0 and pd.to_datetime(a[0:10]) >= file_date]
    calendar_df = generate_calendar_df(dmd_col) # # generate calender days basis the month
    # calculate cover_month and remain_days
    dmd_difc_stock = cal_cover_month_remain_days(calendar_df, dmd_difc_stock, dmd_col)
    # update file_date_prev_end_stock as inventory data
    file_data_prev_avail_stock_var = file_date_prev.strftime('%Y-%m-%d') + '-avail_stock_in_tons'
    file_data_prev_end_stock_var = file_date_prev.strftime('%Y-%m-%d') + '-end-stock'
    dmd_difc_stock[file_data_prev_end_stock_var] = dmd_difc_stock[file_data_prev_avail_stock_var]   

    # Append 3 months demand by latest month, eg: 2023-04 ~ 2023-06 demand not available, use 2023-03 demand instead
    dmd_difc_stock_copy = generate_copy_append_3_month(dmd_difc_stock, dmd_col, demand_following_month=3)

    # calculate end stock 
    # version 1: all sames logic
    # version 2: nearing month end stock is given 
    logic_2_date = []
    dmd_difc_stock = cal_endstock(dmd_difc_stock,  dmd_col, logic_2_date, logic_version=1)  
    # calculate production need 
    # for version 1:  logic_2_date = []
    # for version 2: logic_2_date = [current_month, current_month+1, ..., current_month+mps_month-1]
    dmd_difc_stock = cal_prod_need(dmd_difc_stock,  logic_2_date)
    prod_col = [f'{a}' for a in dmd_difc_stock.columns if a.find('production')>0]
    prod_output = dmd_difc_stock[['SKU', 'RDC'] + prod_col]
    prod_output = prod_output.set_index(['SKU', 'RDC']).stack().reset_index().rename(columns={'level_2':'Month',0:'Demand'}).drop_duplicates()
    prod_output['Month'] = prod_output['Month'].str[0:10]
    prod_output['SKU'] = prod_output['SKU'].astype(str)

    ## Group by at SKU, RDC, Month level 
    prod_output = prod_output[['SKU','RDC','Month','Demand']].groupby(['SKU','RDC','Month']).agg({'Demand': 'sum'}).reset_index()

    #prod_output['ConvertedDate'] = prod_output['Month'].astype('string').str[:7] # can be avoided
    prod_output['quarter'] = pd.PeriodIndex(prod_output['Month'], freq='Q')
    prod_output['quarter_month_num']=prod_output.groupby(['SKU','RDC','quarter'])['Month'].cumcount()+1
    prod_output['quarter'] = prod_output['quarter'].astype(str)
    dmd_after_DIFC_Inv_MPS= prod_output.copy()

    prod_output_test = prod_output.merge(sku_line_group[['SKU','Group','Brand']].drop_duplicates(),left_on='SKU',right_on='SKU',how='left')
    def prebuild(prod_output,RCCP_plan_1):
        
        ## Prebuild- prod output -step 1
        prod_output_1 = prod_output.copy()
        prod_output_1['Month']= pd.to_datetime(prod_output_1['Month'])
        prod_output_brand = prod_output_1.merge(sku_line_group[['SKU','Group']].drop_duplicates(), left_on='SKU',right_on='SKU',how='left')

        ## Prebuild prod output -step 1 : Aggregate demand at Group, quarter, month & SKU
        prod_output_group = prod_output_brand.groupby(['Group','quarter','quarter_month_num','Month','SKU']).agg({'Demand': 'sum'}).reset_index()

        ## Prebuild prod output -step 1 : Aggregate demand at Group, quarter, month
        prod_output_group['Monthly_Demand_all_SKU'] = prod_output_group.groupby(['Group','quarter','quarter_month_num','Month'])['Demand'].transform('sum')

        # Prebuild- RCCP data- step 2
        RCCP_plan_weighted_throughput_agg_month = RCCP_plan_1[['Group','quarter','Year-Month','prod_cap','prod_cap_add']]                                                            .groupby(['Group','quarter','Year-Month']).agg({'prod_cap': 'sum','prod_cap_add':'sum'}).reset_index()
        RCCP_plan_weighted_throughput_agg_month['quarter'] = RCCP_plan_weighted_throughput_agg_month['quarter'].astype(str)

        ## Prebuild step 3 :Merge Dmd with RCCP_plan_group level
        prod_out_cap = prod_output_group.merge(RCCP_plan_weighted_throughput_agg_month[['Group','quarter','Year-Month','prod_cap','prod_cap_add']], left_on=['Group','quarter','Month'],                                                                    right_on=['Group','quarter','Year-Month'],how='left')

        ## Prebuild step 4: cal of Prebuild qty and 
        # Pivot quarter month num
        pb0_pivot = pd.pivot_table(prod_out_cap[['Group','quarter','quarter_month_num','SKU','Demand','prod_cap','Monthly_Demand_all_SKU']],                                            index=['Group','quarter','SKU'],columns=['quarter_month_num'], aggfunc=np.min).reset_index()
        pb0_pivot.columns = pb0_pivot.columns.get_level_values(0) + pb0_pivot.columns.get_level_values(1).astype(str)
        pb0_pivot['diff1'] = pb0_pivot['prod_cap1'] - pb0_pivot['Monthly_Demand_all_SKU1']
        pb0_pivot['diff2'] = pb0_pivot['prod_cap2'] - pb0_pivot ['Monthly_Demand_all_SKU2']
        pb0_pivot['diff3'] = pb0_pivot['prod_cap3'] - pb0_pivot['Monthly_Demand_all_SKU3']
        pb0_pivot['Qtr_Demand_all_SKU'] = pb0_pivot['Monthly_Demand_all_SKU1'] + pb0_pivot['Monthly_Demand_all_SKU2'] + pb0_pivot['Monthly_Demand_all_SKU3']
        pb0_pivot['Qtr_Cap_all_SKU'] = pb0_pivot['prod_cap1'] + pb0_pivot['prod_cap2'] + pb0_pivot['prod_cap3']

        #Keep: Qtr D >0 @ SKU level
        pb0_pivot = pb0_pivot[(pb0_pivot['Demand1'] + pb0_pivot['Demand2'] + pb0_pivot['Demand3']) > 0]
        
        #
        pb0_pivot['Drop_reason'] = np.where((pb0_pivot['Qtr_Demand_all_SKU'] > pb0_pivot['Qtr_Cap_all_SKU']),"Qtr D > Qtr Cap", np.where((pb0_pivot['diff1'] < 0),                                                'M1 D > M1 Cap',"Qtr D < Qtr Cap"))
        pb_dropped_1= pb0_pivot[pb0_pivot['Drop_reason'].isin(['Qtr D > Qtr Cap','M1 D > M1 Cap'])]
        brand_quarter_dropped = pb_dropped_1[['Group','quarter','Drop_reason']].drop_duplicates()

        #pb2 = pb0_pivot[~pb0_pivot['Drop_reason'].isin(['Qtr D > Qtr Cap','M1 D > M1 Cap'])]
        pb2 = pb0_pivot.copy() # try droped grp_qtr into model 

        #Prebuild- Demand updation
        pb2['Group-quarter'] = pb2['Group'] + "-" + pb2['quarter']
        pb2['prebuild_d3'] = pb2.apply(lambda x: x['diff3']*x['Demand2']/x['Monthly_Demand_all_SKU2'] if x['diff3'] < 0 else 0, axis=1)
        pb2['updated_Demand3'] = pb2['Demand3'] - pb2['prebuild_d3'].abs()
        pb2['updated_Demand2_inter'] = pb2['Demand2'] + pb2['prebuild_d3'].abs()
        pb2['diff2_updated'] = pb2['prod_cap2']-(pb2.groupby(['Group','quarter'])['updated_Demand2_inter'].transform('sum'))
        pb2['count_SKU'] = pb2.groupby(['Group','quarter'])['SKU'].transform('count')
        pb2['prebuild_d2'] = pb2.apply(lambda x: x['diff2_updated']*x['Demand1']/x['Monthly_Demand_all_SKU1'] if ( x['diff2_updated'] < 0 and x['Monthly_Demand_all_SKU1'] > 0)                                        else ( (x['diff2_updated'] / x['count_SKU']) if (x['Monthly_Demand_all_SKU1'] == 0 and x['diff2_updated']<0 ) else 0) , axis=1)
        pb2['updated_Demand2'] = pb2['updated_Demand2_inter'] - pb2['prebuild_d2'].abs()

        excp = pb2[['Group-quarter']][pb2['updated_Demand2']<0].drop_duplicates()
        for group_quarter in excp['Group-quarter'].unique():
            pb2['prebuild_d2'] = pb2.apply(lambda x: x['diff2_updated']*x['Demand2']/x['Monthly_Demand_all_SKU2'] if x['diff2_updated'] < 0 else 0, axis=1)
            pb2['updated_Demand2'] = pb2['updated_Demand2_inter'] - pb2['prebuild_d2'].abs()

        pb2['updated_Demand1'] = pb2['Demand1'] + pb2['prebuild_d2'].abs()

        #Process prebuild processed file, model_input
        model_input_unpivot = pd.melt(pb2, id_vars=['Group','quarter','SKU'], value_vars=['updated_Demand1', 'updated_Demand2','updated_Demand3'])
        model_input_unpivot = model_input_unpivot.rename(columns={'variable':'quarter_month_num','value':'Prebuild_Demand'})
        model_input_unpivot['quarter_month_num'] = model_input_unpivot['quarter_month_num'].str[-1:].astype(int)
        model_input_unpivot['SKU'] = model_input_unpivot['SKU'].astype(str)

        #prod_output with Group info
        prod_output_brand_0 =  prod_output_brand.copy()
        #Calculate ratio & Replace demand with prebuilt demand at RDC level (Brand,quarter,RDC,Month,SKU level ratio)
        model_input_raw = prod_output_brand_0.merge(model_input_unpivot,on=['Group','quarter','quarter_month_num','SKU'],how='inner')
        model_input_raw['Ratio'] = model_input_raw['Demand']/model_input_raw.groupby(['Group','quarter','quarter_month_num','Month','SKU'])['Demand'].transform('sum')
        model_input_raw['Prebuild_Demand_RDC'] = model_input_raw['Ratio']*model_input_raw['Prebuild_Demand']
        model_input_raw = model_input_raw[['SKU', 'RDC', 'Month','Prebuild_Demand_RDC', 'quarter','quarter_month_num']].rename(columns={'Prebuild_Demand_RDC':'Demand'}).replace(np.nan, 0)

        #Adding group, brand in model input
        model_input_raw_1 = model_input_raw.merge(sku_line_group[['SKU','Group','Brand']].drop_duplicates(),on='SKU',how='left')

        #Group & quarter for model
        quarter_model = model_input_raw_1[['Group','quarter']].drop_duplicates()
        
        return pb0_pivot, pb2, model_input_raw_1, quarter_model, pb_dropped_1,brand_quarter_dropped
    pb, pb2, model_input_raw_1, quarter_model, pb_dropped_1, brand_quarter_dropped = prebuild(prod_output,RCCP_plan_1)

    b = time.time()
    print("List of Brand -Quarter for model-in")
    print(quarter_model)
    print("List of Brand -Quarter for model-dropped")
    print(brand_quarter_dropped)
    print("Groups into model:",len(pd.unique(quarter_model['Group'])))
    print("Groups out  model:",len(pd.unique(brand_quarter_dropped['Group'])))

    return quarter_model, model_input_raw_1, sku_line_group, RCCP_plan_1, \
        oven_throughput_group, group_1,group_pack_ratio_1,grp_line_flvr,\
            transportation_cost_SKU_Plant_RDC, SKU_master,\
                dmd_df_base, comp_sku_ratio, comp_sku_prod, \
                    pb, pb2, brand_quarter_dropped, pb_dropped_1,\
                        dmd_copack_nopack_1, inv_raw_difc