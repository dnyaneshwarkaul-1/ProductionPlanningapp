# -*- coding: utf-8 -*-
"""
"""
#Important
#Change Path of stored files in your desktop on line 63 and line 2410- 2456-----



#Imports Libraries
import gurobipy as gb
import numpy as np
import pandas as pd
import re
import os
import streamlit as st # web interactive UI
from PIL import Image
import matplotlib.pyplot as plt
from matplotlib.ticker import MultipleLocator
import matplotlib.patches as mpatches 
#import seaborn 
#import warnings

def load_image(img):
    im=Image.open(os.path.join(img))
    return im
@st.cache
def convert_df(df):
   return df.to_csv().encode('utf-8')
# @st.cache
# def convert_jpg(image):
#     return image.encode('utf-8')

#@st.cache(suppress_st_warning=True)
@st.cache(allow_output_mutation=True,suppress_st_warning=True)
def func(demand_file,Start_hour,Threshold,options,week_no,file_3_1):
    string=week_no
    N=Start_hour
    M=Threshold
    flav_seq=options
    file_3_2=file_3_1
    demand_file3=demand_file
    def func1():
    #wk_start_hrs = 0  #Weekly start constraint

    ### Demand Conversion - using Tank size , last tank filled is with 90% 
        Kg_full_tank= 1036.27
        Ratio = 0.71

    # Over Capacity
        oven_cap = 4107
        m1_m2_p_sum = 4107
        section_cap = [1,1,1,0.185,0.47,0.47]

    # 3Kg Under / Over productio Scenarios 1,2,3,4 & 5
    #threshold_3kg = 10 # need check % or decimal number
        threshold_multiple_machines = 10
        up_limit = 0.1
        low_limit = 0.1
        low_limit_scn2 = 0.05  # Over production Cutting all ending jobs 
        underproduction_threshold = 0.9

        up_limit_scn4=0.05 # Under production Extending all ending jobs 
        overproduction_pu = 0.15
    
        return Kg_full_tank,Ratio,oven_cap,m1_m2_p_sum,section_cap,threshold_multiple_machines,up_limit,low_limit ,low_limit_scn2 ,underproduction_threshold ,up_limit_scn4,overproduction_pu
    def path_X():
        path_X=os.path.dirname(__file__)
        # print(x)
        # path_X=("C:\\Users\\gururaj.kunagi\\Downloads\\Streamlit_FMCG\\")
        return path_X
    def func2():
        path=path_X()
        #In-out
        #path_2=("C:\\Users\\gururaj.kunagi\\Downloads\\FMCG_Biscuit") # outout
        inp_file = "\\Oreo_data"
        file_1= pd.read_excel(path + inp_file+".xlsx",index_col=0, header = 0, sheet_name= "Active_jobs_2")#,usecols="A:H")
    
        return file_1

    def func_file():
        #path=("C:\\Users\\gururaj.kunagi\\Downloads\\FMCG_Biscuit\\") #In-out
        #path_2=("C:\\Users\\gururaj.kunagi\\Downloads\\FMCG_Biscuit") # outout
        path=path_X()
        inp_file = "\\Oreo_data"
        output_file="Production_Plan"
        file_2 = pd.read_excel(path + inp_file+".xlsx",index_col=0, header = 0, sheet_name= "Capacity",nrows=7,usecols="A:D")
        
        return file_2
    
    def func3(i):
        path=path_X()
        #path=("C:\\Users\\gururaj.kunagi\\Downloads\\FMCG_Biscuit\\") #In-out
    #path_2=("C:\\Users\\gururaj.kunagi\\Downloads\\FMCG_Biscuit") # outout
        inp_file = "\\Oreo_data"
        file_1 = pd.read_excel(path + inp_file+".xlsx",index_col=0, header = 0, sheet_name= "Active Jobs",skiprows=i,nrows=1,usecols="A:H")

        #path=("C:\\Users\\gururaj.kunagi\\Downloads\\FMCG_Biscuit\\") #In-out
    #path_2=("C:\\Users\\gururaj.kunagi\\Downloads\\FMCG_Biscuit") # outout
        inp_file = "\\Oreo_data"
        output_file="Production_Plan"
        file_2 = pd.read_excel(path + inp_file+".xlsx",index_col=0, header = 0, sheet_name= "Capacity",nrows=7,usecols="A:D")
    
        #path=("C:\\Users\\gururaj.kunagi\\Downloads\\FMCG_Biscuit\\") #In-out
    #path_2=("C:\\Users\\gururaj.kunagi\\Downloads\\FMCG_Biscuit") # outout
        inp_file = "\\Oreo_data"
        file_4 = pd.read_excel(path + inp_file + ".xlsx",index_col=0, header = 0, sheet_name= "Change over")
    
        return file_1,file_2,file_4
    
    def func4():
        path=path_X()
        #path=("C:\\Users\\gururaj.kunagi\\Downloads\\FMCG_Biscuit\\") #In-out
    #path_2=("C:\\Users\\gururaj.kunagi\\Downloads\\FMCG_Biscuit") # outout
        inp_file = "\\Oreo_data"
        output_file="Production_Plan"
        file_2 = pd.read_excel(path + inp_file+".xlsx",index_col=0, header = 0, sheet_name= "Capacity",nrows=7,usecols="A:G")
        file_2.rename(columns = {'Portion1':"P1","Portion2":"P2","Portion3":"P3"}, inplace = True)
    
        #path=("C:\\Users\\gururaj.kunagi\\Downloads\\FMCG_Biscuit\\") #In-out
    #path_2=("C:\\Users\\gururaj.kunagi\\Downloads\\FMCG_Biscuit") # outout
        inp_file = "\\Oreo_data"
        file_4 = pd.read_excel(path + inp_file + ".xlsx",index_col=0, header = 0, sheet_name= "Change over")
        return file_2,file_4
  
    def func5():
        path=path_X()
        #path=("C:\\Users\\gururaj.kunagi\\Downloads\\FMCG_Biscuit\\") #In-out
 #path_2=("C:\\Users\\gururaj.kunagi\\Downloads\\FMCG_Biscuit") # outout
        inp_file = "\\Oreo_data"
        file_4 = pd.read_excel(path + inp_file + ".xlsx",index_col=0, header = 0, sheet_name= "Change over")
    # Change over matrix in required form
        From = []
        To = []
        ChangeOver = []
        f2f = []
        for index in file_4.index:
            for col in file_4.columns:
                f2f.append(str(col)+str(index))
                To.append(index)
                From.append(col)
                ChangeOver.append(file_4[index][col])

        file_co = pd.DataFrame({'f2f':f2f,'From':From,'To':To,'ChangeOver':ChangeOver})
        return file_co

    # def func6(N,key):
    #     path=path_X()
    #     #path=("C:\\Users\\gururaj.kunagi\\Downloads\\FMCG_Biscuit\\") #In-out
    # #path_2=("C:\\Users\\gururaj.kunagi\\Downloads\\FMCG_Biscuit") # outout
    #     inp_file = "\\Oreo_data"
    #     output_file="Production_Plan"
    #     file_3 = pd.read_excel(path + inp_file+".xlsx",index_col=0, header = 0, sheet_name= "Dmd wk"+N+"-2",skiprows=15,nrows=9,usecols="B:J")
    #     return file_3

    
    
    
    def Gantt_chart(prod_plan_out_scn5,file_3,KPI_1,KPI_2,KPI_3,Weekly_start_hour,string):
        path=path_X()
        flav_co=KPI_1
        setup_d=KPI_2
        Flavor_change_over_time_1=KPI_3
        Number=string
        file_1=func2()
        file_2,file_4=func4()
#####B and H
        B = [(i,j) for i in list(file_1.index) for j in list(file_1.columns) if file_1.loc[i][j] == 1  ]
        H = {(B[i],B[j]): file_4.loc[B[i][0]][B[j][0]] if B[i][1] == B[j][1] else file_4.loc[B[i][0]][B[j][0]]+1for i in range(len(B)) for j in range(len(B))}
        for key, value in H.items():
            if key[0][1] == "116g" and key[1][1] == "116g-f1":
                H[key] = 0
            elif key[0][1] == "116g-f1" and key[1][1] == "116g":
                H[key] = 0
        final_data = prod_plan_out_scn5.sort_values(by=['Machine','Start_Time'],ascending=True).reset_index(drop=True)

        final_data['Duration']= final_data['End_Time']- final_data['Start_Time']
        final_data['Marker']=np.where(final_data['Duration']>=48,final_data['Start_Time']+ 48,"")

        liste_m = []
        for i in range(len(final_data)):
            tup = (((final_data['Flavor'][i],final_data['Pack size'][i]),final_data['Machine'][i]),final_data['Start_Time'][i],final_data['End_Time'][i],final_data['Marker'][i])
            liste_m.append(tup)
    
#######################################################
        cleaning_time=0.5

        color= ["red","pink","yellow","orange","grey","green","purple","magenta","blue","cyan","black","darkseagreen","chocolate"
         ,"lightsalmon","aqua","coral","darkred","azure","limegreen","bisque"]
        flv = list(final_data['Flavor'].unique())
        cf = {i : j for (i,j) in list(zip(flv,color))}

        img=plt.figure(figsize=(35,20))
        m3 = MultipleLocator(8.0)
        for m in list(file_2.columns):
            for k in range(len(liste_m)-2):
                if liste_m[k][0][1] == m:
                    plt.barh(m,liste_m[k][2]-liste_m[k][1],left = liste_m[k][1],color = cf[liste_m[k][0][0][0]], height = 0.4)
            #print(k,liste_m[k][0][0],H[liste_m[k][0][0],liste_m[k+1][0][0]])
                    plt.barh(m,H[liste_m[k][0][0],liste_m[k+1][0][0]],left=liste_m[k][2],height = 0.4, color = "white", hatch = "\\X//")
                    if (liste_m[k][2] - liste_m[k][1]) >= 48:
                        plt.axvline(x =liste_m[k][3] , color = 'blue',marker='o', linestyle='dashed',linewidth=10,markersize=2)
        
        font = {'family': 'serif',
                'color':  'Black',
                'weight': 'normal',
                'size': 48,
                }    
            

        labels_1 = [ '', 'Day-1', '' ,'Day-2', '' ,'Day-3', '','Day-4', '','Day-5', '','Day-6', '','Day-7', '']
        plt.xticks(ticks = range(0,int(max(final_data['End_Time'])+30),24),rotation = 0,labels = labels_1, minor = True)
        plt.yticks(file_2.columns, rotation = 45)
        plt.xlabel("Start/ End (Hrs)",fontdict=font)
        plt.ylabel("Machines",fontdict=font)

        leg = []
        for x,y in cf.items():
            leg.append(mpatches.Patch(color=y, label=x))

        plt.legend(handles=leg,loc='upper center', bbox_to_anchor=(0.5, 1),fancybox=True, shadow=True, ncol=10)
        
        for i in range(len(liste_m)):
            plt.text((liste_m[i][1]+liste_m[i][2])/2,list(file_2.columns).index(liste_m[i][0][1])-0.20,liste_m[i][0][0][0]+"-"+liste_m[i][0][0][1], fontsize = 16,rotation = 90)
            

        #plt.axes().xaxis.set_minor_locator(m3) # just commented
        plt.grid(axis='x', linestyle = '--',which='minor', linewidth = 0.5,color = 'red') # color = 'green'
        plt.grid(axis='x', linestyle = '-', which='major',linewidth = 1.0,color = 'black') # color = 'green'

        plt.suptitle("Production Planing Scheduling: "+"week"+Number,fontsize = 26,fontweight="bold")

        # plt.text(170,'P1',"# of Jobs: "+str(len(liste_m)) +"\n\n# of Machines: " +str(len(list(file_2.columns))) 
        #       + "\n\n# of Change_Overs Overall: "+ str(setup_d['Setup_n'].sum())+ "\n\n Flavor Change_Over Time: " 
        #       + str(Flavor_change_over_time_1['Flavor_change_over_time '].sum())+' ( Hrs)'
        #       + "\n\nTotal_Makespan_Time: " + str(max(final_data['End_Time']))+' (Hrs)',fontsize=24,bbox=dict(facecolor='blue',alpha=0.1))
        Jobs=str(len(liste_m))
        N_Machines=str(len(list(file_2.columns)))
        overall_change=str(setup_d['Setup_n'].sum())
        Flavor_change_time=str(Flavor_change_over_time_1['Flavor_change_over_time '].sum())
        Total_M_S_time=str(max(final_data['End_Time'])-Weekly_start_hour)
        #plt.tight_layout(pad=2) # just commented
        plt.savefig(path+Number+".png",bbox_inches='tight',dpi=400)
        #img=plt.show()
        #img=st.pyplot(fig)
        
        #MKST="\n\nTotal_Makespan_Time: " + str(max(final_data['End_Time']))+' (Hrs)'
        return img,liste_m,Jobs,N_Machines,overall_change,Flavor_change_time,Total_M_S_time
    

    def F2FMapping(data_prep,Demand_gap,P,Q):
    #data_prep = prod_plan_scn4_pout_2.copy()
    #Sorting needed to make robust
        wk_start_hrs=P
        threshold_3kg=10
        data_prep=data_prep.sort_values(by=['Start_Time','End_Time'], ascending=True).reset_index(drop=True)

#
#Min Start at Flavor Level
        flav_min = data_prep.groupby(['Flavor']).agg({'Start_Time': 'min'}).reset_index()
        flav_min.rename(columns = {'Start_Time':'Min_Time'}, inplace = True)
  
        data_prep=data_prep.merge(flav_min, on = ['Flavor'], how = "left")

#Max Start at Flavor Level
        flav_max = data_prep.groupby(['Flavor']).agg({'End_Time': 'max'}).reset_index()
        flav_max.rename(columns = {'End_Time':'Max_Time'}, inplace = True)

        data_prep=data_prep.merge(flav_max, on = ['Flavor'], how = "left")
#data_prep.head(8)

###
        flavor_max_df = data_prep[['Flavor', 'Max_Time']].drop_duplicates()
        flavor_max_df['Lag_maxtime'] = flavor_max_df['Max_Time'].shift(1)
        flavor_max_df['Lag_flavor'] = flavor_max_df['Flavor'].shift(1)
        flavor_max_df.drop(columns = ['Max_Time'], inplace = True)

        data_prep = pd.merge(data_prep, flavor_max_df, how = 'left', on = 'Flavor')

        data_prep['diff'] = data_prep['Min_Time'] - data_prep['Lag_maxtime']
        data_prep['f2f'] = data_prep['Lag_flavor']+data_prep['Flavor'] 
#data_prep.head(8)

        file_co=func5()
        data_prep = pd.merge(data_prep, file_co, how = 'left', on = ['f2f', 'f2f'])
        data_prep.drop(columns = ['From','To'], inplace = True)

        data_prep['co_diff'] = data_prep['diff'] - data_prep['ChangeOver']

#
        co_diff_val = []
        count = 1

        for c in range(len(data_prep)):
            if count == 1:
                co_diff_val.append(0)
                count+=1
            elif data_prep['Flavor'][c]!=data_prep['Flavor'][c-1]:
                co_diff_val.append(data_prep['co_diff'][c])
            else:
                co_diff_val.append(0)
          
        data_prep['co_diff_val'] = co_diff_val

        data_prep['cumsum'] = data_prep['co_diff_val'].cumsum(axis = 0)

        data_prep['new_start_f2f'] = data_prep['Start_Time'] - data_prep['cumsum']
        data_prep['new_end_f2f'] = data_prep['End_Time'] - data_prep['cumsum']

#
        data_prep['Start_Time'] = data_prep['new_start_f2f']
        data_prep['End_Time'] = data_prep['new_end_f2f']

        data_prep.drop(labels = ['Min_Time','Lag_maxtime','Max_Time', 'Lag_flavor', 'diff', 'f2f', 'ChangeOver', 'co_diff',
           'co_diff_val', 'cumsum', 'new_start_f2f', 'new_end_f2f'], inplace=True, axis = 1)

#
        data_prep['Actual_prod'] = (data_prep['End_Time'].astype(float) - data_prep['Start_Time'].astype(float)) * data_prep['Capacity'].astype(float) * (data_prep['Portion_%_cap'].str[:-1].astype(float)/100)

        prod_plan_scn4_pout_1=data_prep.copy()

#Get updated demand and calculate ratio of updated production volume
        updated_demand = prod_plan_scn4_pout_1.groupby(['Flavor', 'Pack size'], as_index = False).agg({'Actual_prod': 'sum'})

#Calculating gap again with updated production values
        updated_demand1 = updated_demand.merge(Demand_gap[['Flavor', 'Pack size', 'Demand']], on = ['Flavor', 'Pack size'], how = 'left')
        updated_demand1['GAP_value']=(updated_demand1['Actual_prod'] - updated_demand1['Demand'])
        updated_demand1['gap'] = (updated_demand1['Actual_prod'] - updated_demand1['Demand'])*100/updated_demand1['Demand']
# Actual Vs Demabd at flavor level
        flav_dem_prod = updated_demand1.groupby(['Flavor'], as_index = False).agg({'Actual_prod': 'sum','Demand':'sum'})

        flav_dem_prod['GAP'] = flav_dem_prod['Actual_prod']-flav_dem_prod['Demand']
        flav_dem_prod['GAP %']= (flav_dem_prod['GAP']/flav_dem_prod['Demand'])*100
        Demand_gap_2 = updated_demand1
        
    
        return prod_plan_scn4_pout_1,Demand_gap_2,flav_dem_prod
    
    def func7(file_1,file_2,file_3,file_4):
    #--------------------------------------------------------------------------
    #-----------------------------------------------------------------------
    
        oven_cap = 4107
        section_cap = [1,1,1,0.185,0.47,0.47]
        section_capacity = {m: oven_cap*j for (m,j) in zip((file_2.columns.tolist()),section_cap)}

        B = [(i,j) for i in file_1.index.tolist() for j in file_1.columns.tolist()
             if  file_1.loc[i][j] == 1 and file_3.loc[i][j] > 0 ]

        A = [(i,m) for i in B for m in file_2.columns.tolist() if file_2.loc[i[1]][m] > 0 and file_2.loc[i[1]][m] <= section_capacity[m]]

        C = [(B[i],B[j]) for i in range(len(B)) for j in range(len(B)) if j > i]

        H = {(B[i],B[j]): file_4.loc[B[i][0]][B[j][0]] if B[i][1] == B[j][1] else file_4.loc[B[i][0]][B[j][0]]+1
             for i in range(len(B)) for j in range(len(B)) if j != i}

        for key, value in H.items():
            if key[0][1] == "116g" and key[1][1] == "116g-f1":
                H[key] = 0
            elif key[0][1] == "116g-f1" and key[1][1] == "116g":
                H[key] = 0
              
        D = [(i,j,m) for (i,j) in C for m in file_2.columns.tolist() if (i,m) in A and (j,m) in A ]

        F = [(i,j,m,k) for m in file_2.columns.tolist() for k in file_2.columns.tolist() for i in B for j in B
           if m != k and (i,m) in A and (j,k) in A]

        S = [(i,j) for i in file_1.index.tolist() for j in file_1.index.tolist() if file_1.index.tolist().index(j) > file_1.index.tolist().index(i)]

        Capacity = {(i,j): file_2.loc[i[1]][j] for (i,j) in A}
    
        mdl1 = gb.Model("parallell_Machine_2")
        M = 700 # Big M,
        after_dif = mdl1.addVars(F,vtype = gb.GRB.BINARY,name = "after_different")
        after_diff = mdl1.addVars(S,vtype = gb.GRB.BINARY,name = "after_differentt")
        after =mdl1.addVars(D,vtype = gb.GRB.BINARY,name = "after")
        overlap = mdl1.addVars(F,vtype = gb.GRB.BINARY,name = "overlapping")
        finish = mdl1.addVars(A, name = "finish")
        start_ = mdl1.addVars(A,name = "start_")
        makespan_ = mdl1.addVar(name = "makespan_")
        assign =mdl1.addVars(A,vtype = gb.GRB.BINARY,name = "assign")
        split = mdl1.addVars(A, lb = 0, name = "partial_p_amount")
    #eqn 1:
        mdl1.setObjectiveN(gb.quicksum(finish[j,m] for m in file_2.columns.tolist()  for j in B if (j,m) in A),0,0,1) 
    #eqn 2:
        mdl1.setObjectiveN(makespan_,1,1,1)
    #mdl1.addConstr(makespan_ <= 168)
    #eqn 3:
        mdl1.addConstrs(makespan_ >= finish[j,m] for m in file_2.columns.tolist()  for j in B if (j,m) in A)
    #Spliting of job/ SKU ---> on two machines 
    #eqn 4:
        mdl1.addConstrs((gb.quicksum(split[j,m] for m in file_2.columns.tolist() if (j,m) in A) == file_3.loc[j[0]][j[1]] for j in B),
                name = "kısıt1")
    # Finish time cal 
    #eqn 5:
        mdl1.addConstrs((finish[j,m]  >= start_[j,m]+split[j,m]/(Capacity[j,m]) for m in file_2.columns.tolist()
                for j in B if file_2.loc[j[1]][m] != 0 and (j,m) in A), name = "kısıt2")
    # Assigments of Jobs on MC based on input matrix
    #eqn 6:
        mdl1.addConstrs(split[j,m] -assign[j,m]*189456 <=0 for m in file_2.columns.tolist() for j in B if (j,m) in A)
    #eqn 7:
        mdl1.addConstrs(gb.quicksum(assign[j,m] for m in file_2.columns.tolist() if (j,m) in A)
                    >= 1 for j in B )
    #eqn 8:
        mdl1.addConstrs(start_[j,m_] >= finish[i,m] -M*(after_dif[i,j,m,m_])  
        for m in file_2.columns.tolist()[3:] for m_ in file_2.columns.tolist()[3:]
        for i in B for j in B if (j,m) in A and (i,m) in A and (j,m_) in A and (i,m_) in A and m != m_)
    # Assigments and Non- Interfernace 
    #eqn 9:
        mdl1.addConstrs((start_[i,m] >= finish[j,m_] - M*(1-after_diff[i[0],j[0]])+ H[j,i]-M*(1-assign[i,m])-M*(1-assign[j,m_])
        for m in file_2.columns.tolist() for m_ in file_2.columns.tolist() for i in B for j in B if B.index(j) > B.index(i) and  
                    (i[0],j[0]) in S and (i,m) in A and (j,m_) in A and m != m_),name = "flv1")
    #eqn 10:
        mdl1.addConstrs((start_[j,m_] >= finish[i,m] -M*(after_diff[i[0],j[0]])+ H[i,j]-M*(1-assign[i,m])-M*(1-assign[j,m_]) 
        for m in file_2.columns.tolist() for m_ in file_2.columns.tolist() for i in B for j in B if B.index(j) > B.index(i) and 
                    (i[0],j[0]) in S and (i,m) in A and (j,m_) in A and m != m_),name = "flv2")
    #eqn 11:
        mdl1.addConstrs(start_[i,m] >= finish[j,m] - M*(1-after[i,j,m]) + H[j,i]-M*(1-assign[i,m])-M*(1-assign[j,m])
            for m in file_2.columns.tolist() for i in B for j in B if B.index(j) > B.index(i) and (j,m) in A and (i,m) in A)
    #eqn 12:
        mdl1.addConstrs(start_[j,m] >= finish[i,m] - M*(after[i,j,m])+ H[i,j]-M*(1-assign[i,m])-M*(1-assign[j,m])
        for m in file_2.columns.tolist() for i in B for j in B 
        if B.index(j) > B.index(i) and (j,m) in A and (i,m) in A)
    #mdl1.Params.MIPFocus = 2
        mdl1.Params.TimeLimit = 250
        mdl1.optimize()
        
        def round_off_rating(number):
            return round(number*4)/4

        liste = []
        for i in split:
            if split[i].x > 0:
                liste.append((i,round_off_rating(start_[i].x),round_off_rating(finish[i].x)))
    #print(liste)
    #mdl1.printAttr('X')
        def takeSecond(elem):
            return elem[0][1],elem[1]
        liste.sort(key = takeSecond)
    #print(liste)
    #-------------------------------------------------DATAFRAME#
        return liste
    
    
 
    def func8(liste,file_3,file_2):
        df = pd.DataFrame(liste, columns=['Flavor_Packsize_MC', 'Start_time','Finish_time'])
        df['flavor &packsize'] = df['Flavor_Packsize_MC'].str[1:2]

        Machine = []
        Flavor = []
        Pack_size = []

        for i in range(0,len(df['Flavor_Packsize_MC'])):
            Machine.append(df['Flavor_Packsize_MC'][i][1])
            Flavor.append(df['Flavor_Packsize_MC'][i][0][0])
            Pack_size.append(df['Flavor_Packsize_MC'][i][0][1])
        df['Machine'] = Machine
        df['Flavor'] = Flavor
        df['Pack size'] = Pack_size

    #2. Demand
        demand = []
        demand_m = file_3

        for (flav,ps) in zip(df['Flavor'],df['Pack size']):
            demand.append(demand_m.loc[flav][ps])
    
        df['Demand'] = demand

    # 3.capacity
        capacity = []
        capacity_m = file_2

        for (ps,mc) in zip(df['Pack size'],df['Machine']):
            capacity.append(capacity_m.loc[ps][mc])
    
        df['Capacity'] = capacity

    # 4. Processing
        df['Processing Time'] = df['Finish_time'] - df['Start_time']
        df['Actual_prod'] = df['Capacity'] * df['Processing Time']

        df = df [['Flavor_Packsize_MC',
          
             'Flavor', 'Pack size','Machine','Start_time', 'Finish_time','Processing Time','Capacity','Actual_prod','Demand']]

        df.sort_values(by=['Flavor','Pack size','Machine'], inplace=True)

    # Demand Vs Actual Gap and export to Excel format
        df['Gap'] = (df['Actual_prod'] - df['Demand'])/df['Demand']*100
    #if i==0:
       # df_new_m=df[['Flavor_Packsize_MC',
         #                      'Flavor', 'Pack size',
             #                  'Machine','Start_time',
               #                'Finish_time','Processing Time',
                  #             'Capacity','Actual_prod','Demand']]
    #else:
       # df_new= df_new_m.append(df)
        return df

    def func9(df_new_m,flav_seq):
        file_co=func5()
       
        flavor_seq=flav_seq
            
        Fla=list(df_new_m["Flavor"][1])
        def common(flavor_seq,Fla): 
            Fla_c = [value for value in flavor_seq if value in Fla] 
            return Fla_c
        Flavor_new_seq=common(flavor_seq,Fla)

        df=pd.DataFrame(columns = ['Flavor_Packsize_MC',
                               'Flavor', 'Pack size',
                                 'Machine','Start_time',
                                 'Finish_time','Processing Time',
                                  'Capacity','Actual_prod','Demand'])
        for fla in Flavor_new_seq:
            df_m=df_new_m.loc[df_new_m["Flavor"] == fla]
            df=df.append(df_m)
    
    
    ##########Start time Finish Time

    #Max Start at Flavor Level
        flav_max = df.groupby(['Flavor']).agg({'Finish_time': 'max'}).reset_index()
        flav_max.rename(columns = {'Finish_time':'Max_Time'}, inplace = True)

        df=df.merge(flav_max, on = ['Flavor'], how = "left")

    #Min Start at Flavor Level
        flav_min = df.groupby(['Flavor']).agg({'Start_time': 'min'}).reset_index()
        flav_min.rename(columns = {'Start_time':'Min_Time'}, inplace = True)

        df=df.merge(flav_min, on = ['Flavor'], how = "left")

        flavor_max_df = df[['Flavor', 'Max_Time']].drop_duplicates()
        flavor_max_df['Lag_maxtime'] = flavor_max_df['Max_Time'].shift(1)
        flavor_max_df['Lag_flavor'] = flavor_max_df['Flavor'].shift(1)
        flavor_max_df.drop(columns = ['Max_Time'], inplace = True)

        df = pd.merge(df, flavor_max_df, how = 'left', on = 'Flavor')
 
        df['diff'] = df['Min_Time'] - df['Lag_maxtime']
        df['f2f'] = df['Lag_flavor']+df['Flavor'] 

        df = pd.merge(df, file_co, how = 'left', on = ['f2f', 'f2f'])
        df.drop(columns = ['From','To'], inplace = True)

    #data_prep['co_diff'] = data_prep['diff'] - data_prep['ChangeOver']
        df['co_diff'] = df['diff'] - df['ChangeOver']

        df=df.fillna(0)
##--   --------Updating start and end time----------##
        co_diff_val = []
        count = 1

        for c in range(len(df)):
            if count == 1:
                co_diff_val.append(0)
                count+=1
            elif df['Flavor'][c]!=df['Flavor'][c-1]:
                co_diff_val.append(df['co_diff'][c])
            else:
                co_diff_val.append(0)
          
        df['co_diff_val'] = co_diff_val

        df['cumsum'] = df['co_diff_val'].cumsum(axis = 0)

        df['new_start_f2f'] = df['Start_time'] - df['cumsum']
        df['new_end_f2f'] = df['Finish_time'] - df['cumsum']

#Final modification--------------------
        df['Start_time'] = df['new_start_f2f']
        df['Finish_time'] = df['new_end_f2f']

        df.drop(labels = ['Min_Time','Lag_maxtime','Max_Time', 'Lag_flavor', 'diff', 'f2f', 'ChangeOver', 'co_diff',
           'co_diff_val', 'cumsum', 'new_start_f2f', 'new_end_f2f'], inplace=True, axis = 1)
        return df
#***********************************Huristics*********************************
    def func10(df):
        Flavor = ['Base-Strawberry','Double-B&R','Double-G&P','Single-BC','Single-Green Tea','Single-Rose',
                  'Single-Vanilla','Single-Peach Olong','Single-Yoghurt']
        Flavor_F = ['f1','f2','f3','f4','f5','f6','f7','f8','f9']
        flav_df_1 = pd.DataFrame({"Flavor":Flavor_F,"Flavour":Flavor},index=None)
    #x=df
        base_data = df
    #base_data = base_data.merge(flav_df_1,left_on = "Flavor", right_on = "Flavor")
    #base_portions = base_data.copy()

    #Remove portion rows
        base_data=base_data[~base_data.Machine.str.contains("Portion")]

    #Ignore 0 processing time inputs (later try to handle it in model)
        base_data.drop(base_data[base_data['Processing Time']==0].index,inplace=True)

    #
        data_prep = base_data[['Flavor',
          'Pack size', 'Machine', 'Start_time', 'Finish_time','Capacity']]

        data_prep=data_prep.sort_values(by=['Start_time','Finish_time'], ascending=True).reset_index(drop=True)
    
    
    ###Cleaning 30 - mins after 48 hours
        data_48 = data_prep
        data_48['Processing Time'] = data_48['Finish_time'] - data_48['Start_time']

        data_48 = data_prep[data_prep['Processing Time']>=48].reset_index(drop=True)
        data_48['Break_hr'] = data_48['Start_time'] + 48
    
    ##Break time Assigning
        clean = []
        for i in range(len(data_48)):
            if i == 0:
                clean.append("Yes")
            elif data_48['Flavor'][i]!=data_48['Flavor'][i-1]:
                clean.append("Yes")
            elif data_48['Flavor'][i]==data_48['Flavor'][i-1] and data_48['Finish_time'][i]-data_48['Break_hr'][i-1] >= 48:   
                clean.append('Yes')
            else:
                clean.append('No')

        data_48['Clean'] = clean 
        data_48['Break'] = np.where(data_48['Clean']=="Yes",0.5,0)

        data_48.drop(labels = ['Capacity','Processing Time'], inplace=True, axis = 1)
    
    #Merging
        data_prep = data_prep.merge(data_48,on =['Flavor','Pack size','Machine','Start_time','Finish_time'], how = "left")  
    
        data_prep['Break_hr'] = data_prep['Break_hr'].replace(np.nan, -1)
        data_prep['Clean'] = data_prep['Clean'].replace(np.nan,'No')
        data_prep['Break'] = data_prep['Break'].replace(np.nan, 0)

        data_prep['brk_cumsum'] = data_prep['Break'].cumsum(axis = 0)
        data_prep['lag_brk_cumsum'] = data_prep['brk_cumsum'].shift(1)
        data_prep['lag_brk_cumsum'] = data_prep['lag_brk_cumsum'].replace(np.nan,0)
    #
        flav_counter = []
        i = 0
        for c,flav in enumerate(data_prep['Flavor']):
            if c == 0:
                flav_counter.append(i)
                i += 1
            elif data_prep['Flavor'][c]==data_prep['Flavor'][c-1]:
                flav_counter.append(i)
                i += 1
            elif data_prep['Flavor'][c]!=data_prep['Flavor'][c-1]:
                i = 0
                flav_counter.append(i)
                i += 1
        
        data_prep['flav_counter'] = flav_counter
    #new start and end time
        start = []
        rem_l = data_prep[data_prep['Clean']=="No"]['Break_hr'].unique()
        brk_hr = data_prep[~data_prep['Break_hr'].isin(rem_l)]['Break_hr'].unique()

        for i in range(len(data_prep)):
            if data_prep['Start_time'][i] < brk_hr:
                start.append(data_prep['Start_time'][i])
            else:
                start.append(data_prep['Start_time'][i] + data_prep['lag_brk_cumsum'][i])
        
        data_prep['new_start_48'] = start
        data_prep['new_end_48'] = data_prep['Finish_time'] + data_prep['brk_cumsum']
    
        data_prep['Start_time'] = data_prep['new_start_48']
        data_prep['Finish_time'] = data_prep['new_end_48']

        data_prep.drop(labels = ['Processing Time', 'Break_hr','Clean', 'Break','new_start_48','new_end_48','flav_counter','brk_cumsum','lag_brk_cumsum'], inplace=True, axis = 1)
    
    #Determine the staring machine considering minimum time for each flavor and machine

    #Min Start at Flavor Level
        flav_min = data_prep.groupby(['Flavor']).agg({'Start_time': 'min'}).reset_index()
        flav_min.rename(columns = {'Start_time':'Min_Time'}, inplace = True)

        data_prep=data_prep.merge(flav_min, on = ['Flavor'], how = "left")

    #Max Start at Flavor Level
        flav_max = data_prep.groupby(['Flavor']).agg({'Finish_time': 'max'}).reset_index()
        flav_max.rename(columns = {'Finish_time':'Max_Time'}, inplace = True)

        data_prep=data_prep.merge(flav_max, on = ['Flavor'], how = "left")

    #Flavor and Machine level min and max
        flav_mc_mintime = data_prep.groupby(['Flavor','Machine']).agg({'Start_time': ['min']}).reset_index()
        flav_mc_maxtime = data_prep.groupby(['Flavor','Machine']).agg({'Finish_time': ['max']}).reset_index()
 
        flav_mc_mintime.rename(columns = {'min':'Flav_Mc_Min_Time'}, inplace = True)
        flav_mc_maxtime.rename(columns = {'max':'Flav_Mc_Max_Time'}, inplace = True)

        flav_mc_mintime.columns = flav_mc_mintime.columns.droplevel(1)
        flav_mc_maxtime.columns = flav_mc_maxtime.columns.droplevel(1)

        flav_mc_mintime.rename(columns = {"Start_time":"Flav_Mc_Min_Time"}, inplace = True)
        flav_mc_maxtime.rename(columns = {"Finish_time":"Flav_Mc_Max_Time"}, inplace = True)

        data_prep=data_prep.merge(flav_mc_mintime, on = ['Flavor','Machine'], how = "left")
        data_prep=data_prep.merge(flav_mc_maxtime, on = ['Flavor','Machine'], how = "left")

        data_prep['value'] = data_prep['Flav_Mc_Min_Time'] - data_prep['Min_Time']
    ########----------------------------------------#############
    
        data_prep['new_start'] = data_prep['Start_time'] - data_prep['value']
        data_prep['new_end'] = data_prep['Finish_time'] - data_prep['value']

        data_prep['Start_time'] = data_prep['new_start']
        data_prep['Finish_time'] = data_prep['new_end']
    
        flavor_max_df = data_prep[['Flavor', 'Max_Time']].drop_duplicates()
        flavor_max_df['Lag_maxtime'] = flavor_max_df['Max_Time'].shift(1)
        flavor_max_df['Lag_flavor'] = flavor_max_df['Flavor'].shift(1)
        flavor_max_df.drop(columns = ['Max_Time'], inplace = True)

        data_prep = pd.merge(data_prep, flavor_max_df, how = 'left', on = 'Flavor')

        data_prep['diff'] = data_prep['Min_Time'] - data_prep['Lag_maxtime']
        data_prep['f2f'] = data_prep['Lag_flavor']+data_prep['Flavor'] 
    
        file_co=func5()
    
        data_prep = pd.merge(data_prep, file_co, how = 'left', on = ['f2f', 'f2f'])
        data_prep.drop(columns = ['From','To'], inplace = True)
 
        data_prep['co_diff'] = data_prep['diff'] - data_prep['ChangeOver']
    
        co_diff_val = []
        count = 1

        for c in range(len(data_prep)):
            if count == 1:
                co_diff_val.append(0)
                count+=1
            elif data_prep['Flavor'][c]!=data_prep['Flavor'][c-1]:
                co_diff_val.append(data_prep['co_diff'][c])
            else:
                co_diff_val.append(0)
          
        data_prep['co_diff_val'] = co_diff_val

        data_prep['cumsum'] = data_prep['co_diff_val'].cumsum(axis = 0)

        data_prep['new_start_f2f'] = data_prep['Start_time'] - data_prep['cumsum']
        data_prep['new_end_f2f'] = data_prep['Finish_time'] - data_prep['cumsum']
    
        data_prep['Start_time'] = data_prep['new_start_f2f']
        data_prep['Finish_time'] = data_prep['new_end_f2f']

        data_prep.drop(labels = ['Min_Time','Max_Time','Lag_maxtime', 'Lag_flavor', 'diff', 'f2f', 'ChangeOver', 'co_diff',
          'co_diff_val', 'cumsum', 'new_start_f2f', 'new_end_f2f','value','new_start','new_end','Flav_Mc_Min_Time','Flav_Mc_Max_Time'], inplace=True, axis = 1)
    
        trim_d = data_prep

        for flav in trim_d['Flavor']:
            if trim_d.loc[trim_d['Finish_time']==(trim_d.loc[trim_d['Flavor']==flav,'Finish_time'].max())]['Finish_time'].count() <= 1:
                sc_large = trim_d.loc[trim_d['Flavor']==flav,'Finish_time'].nlargest(2).reset_index(drop=True)
                trim_d.loc[(trim_d['Flavor']==flav) & (trim_d['Finish_time']==sc_large[0]),'Finish_time'] = trim_d.loc[(trim_d['Flavor']==flav) & (trim_d['Finish_time']==sc_large[1]),'Finish_time'].reset_index(drop=True)[0] 

        data_prep = trim_d
    
        return data_prep
#**********************************Demand Gap*********************************#
    def func11(data_prep,file_3_1,N):
    
    #Prepare the data to be ordered based off flavor and Start/End Time
        data1= data_prep[[ 'Flavor','Pack size', 'Machine','Start_time','Capacity']]
        data1['start/end'] = "start"
        data2= data_prep[['Flavor','Pack size', 'Machine','Finish_time','Capacity']]
        data2['start/end'] = "end"

        data1.rename(columns = {'Start_time':'Time'}, inplace = True)
        data2.rename(columns = {'Finish_time':'Time'}, inplace = True)
           
        data = pd.concat([data1,data2], ignore_index=True, axis = 0)
        data=data.sort_values(by=['Time','start/end'], ascending=True).reset_index(drop=True)
        wk_start_hrs=N   
        data['Time'] = data['Time']+wk_start_hrs
    
    #Tagging 

        data['flav_match']= data.Flavor == data.Flavor.shift() 
        data['time_match']= data.Time >= data.Time.shift()

        tagging = []

        for f,t in zip(data['flav_match'],data['time_match']):
            if f == False:
                tagging.append(-1)
            elif f == True and t == True:
                tagging.append(1)
            elif f == True and t == False:
                tagging.append(1)
            else:
                tagging.append(0)
        
        data['Tagging'] = tagging
    
    #Determine the machine leaving the system and the one's getting added
        machine_in_out = []
        add_sub = []
        cnt=0
        for f,t,se in zip(data['flav_match'],data['Tagging'],data['start/end']):
            if f == False:
                machine_in_out.append(data['Machine'][cnt])
                add_sub.append(0)
        
            elif f == True and t == 1 and se == "start":
                machine_in_out.append("+ " + data['Machine'][cnt])
                add_sub.append(1)
        
            elif f == True and t == 1 and se == "end":
                machine_in_out.append("- " + data['Machine'][cnt])
                add_sub.append(-1)
        
            else:
                machine_in_out.append("Running")
                add_sub.append(0)
            cnt += 1
    
        data['Machine_in_out']=machine_in_out
        data['Add_Sub'] = add_sub

        data.drop(labels = ['flav_match','time_match'], inplace=True, axis = 1)
    
    #Determine the staring machine considering minimum time for each flavor

        flav_mintime = data.groupby('Flavor').agg({'Time': ['min', 'max']}).reset_index()

        flav_mintime.rename(columns = {'min':'Min_Time','max':'Max_Time'}, inplace = True)
        flav_mintime.columns = flav_mintime.columns.droplevel(0)
        flav_mintime.rename(columns = {"":"Flavor",'min':'Min_Time','max':'Max_Time'}, inplace = True)

        data=data.merge(flav_mintime, on = ['Flavor'])
    
        flav_cumsum = data[data['Time']==data['Min_Time']][['Flavor','Capacity']].groupby('Flavor')['Capacity'].sum().reset_index()
        flav_cumsum['Tagging']=-1
        flav_cumsum.rename(columns = {'Capacity':'Start_Capacity'}, inplace = True)
    
        data = data.merge(flav_cumsum, on =['Flavor','Tagging'], how = "left")
        data['run_sum'] = data['Add_Sub'] * data['Capacity']
    
    #Determine the cumulative active capacity based off machine's geting added or removed

        m1_m2_m3 = []
        for i in range(len(data)):
            if data['Tagging'][i] == -1:
                m1_m2_m3.append(data['Start_Capacity'][i])
            elif data['start/end'][i] == 'start' and data['Time'][i]==data['Min_Time'][i] :  
                m1_m2_m3.append(m1_m2_m3[i-1])
            elif data['Tagging'][i] != -1:
                m1_m2_m3.append(m1_m2_m3[i-1]+data['run_sum'][i])
        
        data['M1_M2_M3'] = m1_m2_m3  
        data['Req_Portion'] = 4107 - data['M1_M2_M3']
    
        Oven_out = 4107
    #Portion Capacity Matrix
        portion_sb_m = pd.DataFrame({'Portion':['P1','P2','P3'],'Capacity':[0.1*Oven_out,0.185*Oven_out,0.47*Oven_out]})

        portion_ot_m = pd.DataFrame({'Portion':['P1','P2','P3'],'Capacity':[0.185*Oven_out,0.47*Oven_out,0]})
    
    #Determine Utilised Portion Capacity 
    #Determine which portions are getting utlised for each instances

        portion_c = []
        portion = []
        check = []
        portion_capacity = []

        for i in range(len(data)):
    #Populate start lines
            if data['M1_M2_M3'][i] == 0:
                portion_c.append(0)
                portion.append('0')
                portion_capacity.append(0)

            elif data['Machine_in_out'][i] == 'Running':
                portion.append('Previous Portion')
                portion_c.append(portion_c[i-1])
                portion_capacity.append(portion_capacity[i-1])
        
    #Strawberry
    # straw <= P1
            elif data['Flavor'][i] == "Base-Strawberry" and np.floor(data['Req_Portion'][i]) <= portion_sb_m['Capacity'][0]:
                portion_c.append(str(round((data['Req_Portion'][i]*100/portion_sb_m['Capacity'][0])))+'%')
                portion.append(portion_sb_m['Portion'][0])
                portion_capacity.append(portion_sb_m['Capacity'][0])
    
    # straw > P1 and <= P2
            elif data['Flavor'][i] == "Base-Strawberry" and np.floor(data['Req_Portion'][i]) > portion_sb_m['Capacity'][0] and np.floor(data['Req_Portion'][i]) <= portion_sb_m['Capacity'][1]:
                portion_c.append(str(round((data['Req_Portion'][i]*100/portion_sb_m['Capacity'][1]))) + '%')
                portion.append(portion_sb_m['Portion'][1])
                portion_capacity.append(portion_sb_m['Capacity'][1])
    
    # straw > P2 and <= P3    
            elif data['Flavor'][i] == "Base-Strawberry" and np.floor(data['Req_Portion'][i]) > portion_sb_m['Capacity'][1] and np.floor(data['Req_Portion'][i]) <= portion_sb_m['Capacity'][2]:
                portion_c.append(str(round((data['Req_Portion'][i]*100/portion_sb_m['Capacity'][2]))) + '%')
                portion.append(portion_sb_m['Portion'][2])
                portion_capacity.append(portion_sb_m['Capacity'][2])
    
    # straw > P3
            elif data['Flavor'][i] == "Base-Strawberry" and np.floor(data['Req_Portion'][i]) > portion_sb_m['Capacity'][2]:
                portion_c.append(str(round((data['Req_Portion'][i]*100/portion_sb_m['Capacity'][2]))) + '%')
                portion.append(portion_sb_m['Portion'][2])
                portion_capacity.append(portion_sb_m['Capacity'][2])
       
    #Others
    # others <= P1
            elif data['Flavor'][i] != "Base-Strawberry" and np.floor(data['Req_Portion'][i]) <= portion_ot_m['Capacity'][0]:
                portion_c.append(str(round((data['Req_Portion'][i]*100/portion_ot_m['Capacity'][0])))+'%')
                portion.append(portion_ot_m['Portion'][0])
                portion_capacity.append(portion_ot_m['Capacity'][0])
    
    # others > P1 and <= P2
            elif data['Flavor'][i] != "Base-Strawberry" and np.floor(data['Req_Portion'][i]) > portion_ot_m['Capacity'][0] and np.floor(data['Req_Portion'][i]) <= portion_ot_m['Capacity'][1]:
                portion_c.append(str(round((data['Req_Portion'][i]*100/portion_ot_m['Capacity'][1]))) + '%')
                portion.append(portion_ot_m['Portion'][1])
                portion_capacity.append(portion_ot_m['Capacity'][1])
        
    # others > P2
            elif data['Flavor'][i] != "Base-Strawberry" and np.floor(data['Req_Portion'][i]) > portion_ot_m['Capacity'][1]:
                portion_c.append(str(round((data['Req_Portion'][i]*100/portion_ot_m['Capacity'][1]))) + '%')
                portion.append(portion_ot_m['Portion'][1])
                portion_capacity.append(portion_ot_m['Capacity'][1])
   
            else:
                portion_c.append('100%')
                portion.append("determine")
                portion_capacity.append(0)
    
        data['Portion_%_cap'] = portion_c
        data['Portion'] = portion
        data['Portion_Capacity'] = portion_capacity
    
    #Note the instances where machines are either added or removed

        inst = data['start/end'] == data['start/end'].shift()
        time_match = data['Time'] == data['Time'].shift()
        inst = list(inst)

        instance = []
        c = 0
        for i,t in zip(inst,time_match):
            if i == True and t == True:
                instance.append('')
            elif i == True and t == False and data['Time'][c]==data['Max_Time'][c] and data['M1_M2_M3'][c]== 0:
                instance.append('')
            elif i == True and t == False and data['Time'][c]==data['Max_Time'][c]:
                instance.append('Instance')
            else:
                instance.append('Instance')
            c = c + 1
         
        data['Instance'] = instance
    
    #Determine the duration for which the portions are operating

        duration = []
        count = 1

        for c,i in enumerate(data['Flavor']):
            if count == 1:
                duration.append("New Flavor start")
                count+=1
            elif data['Flavor'][c]!=data['Flavor'][c-1]:
                duration.append("New Flavor start")
            elif data['Flavor'][c]==data['Flavor'][c-1] and data['Instance'][c] == 'Instance':
                duration.append(data['Time'][c]-data['Time'][c-1])
            elif data['Flavor'][c]==data['Flavor'][c-1] and data['Instance'][c] == '':
                duration.append('Running')
        
        data['Duration'] = duration
        end_log = []

        for i in range(len(data)):
            if data['Time'][i]==data['Max_Time'][i] and data['start/end'][i]=="end":
                end_log.append('Portion Not Req')
            else:
                end_log.append('Running')
        
        
        data['Portion_f'] = end_log

        data.drop(labels = ['run_sum','Tagging','Add_Sub','Start_Capacity'], inplace=True, axis = 1)
    
    #Use portion flag to eliminate non-comparable numbers
        for i in range(len(data)):
            if data['Portion_f'][i] == "Portion Not Req" and data['Instance'][i] !='Instance':
                data['Req_Portion'][i] = 0
#           data['Portion_%_cap'][i] = "0%"
                data['Portion'][i]="Stop"
                data['Instance'][i]="End"
                if data['Machine_in_out'][i] == "Running":
                    data['Machine_in_out'][i] = "Stop"
            elif data['Duration'][i] == "New Flavor start":
                data['Portion_f'][i] = "Portion Start"
            else:
                continue
    #Re-arrange column values

        for i in range(len(data)):
            if data['Duration'][i] == "Running" and data['Instance'][i] == "End":
                data['Duration'][i] = data['Duration'][i-1]
            elif data['Portion'][i] == "Previous Portion":
                data['Portion'][i] = data['Portion'][i-1]
    #Dump the data for access in excel
    #data_det = data
    #data_det['Machine_in_out'] = str("'") + data_det["Machine_in_out"]
    
        portion_tag = []

        for i in range(len(data)):
            if data['Time'][i]!=data['Min_Time'][i] and data['Portion_f'][i] != "Portion Not Req":
                portion_tag.append('P')
            elif (data['Portion_f'][i] == "Portion Not Req" and data['Instance'][i] == "Instance"):
                portion_tag.append('P')
            else:
                portion_tag.append('')
        
        data['portion_tag'] = portion_tag
    
        Req_Portion = data['Req_Portion']
        Portion_p_cap = data['Portion_%_cap']
        Portion = data['Portion']
        Portion_Capacity = data['Portion_Capacity']
        Duration = data['Duration']
    #Portion Data Prepartion
        Req_Portion1 = []
        Portion_p_cap1 = []
        Portion1 = []
        Portion_Capacity1 = []
# duration1 = []

        for i in range(len(data)):
            if i == 0:
                Req_Portion1.append(Req_Portion[i])
                Portion_p_cap1.append(Portion_p_cap[i])
                Portion1.append(Portion[i])
                Portion_Capacity1.append(Portion_Capacity[i])
#duration1.append(Duration[i+1])
            elif i < len(data)-1:
                Req_Portion1.append(Req_Portion[i-1])
                Portion_p_cap1.append(Portion_p_cap[i-1])
                Portion1.append(Portion[i-1])
                Portion_Capacity1.append(Portion_Capacity[i-1])
#duration1.append(Duration[i+1])
        
            else:
                Req_Portion1.append(Req_Portion[i])
                Portion_p_cap1.append(Portion_p_cap[i])
                Portion1.append(Portion[i])
                Portion_Capacity1.append(Portion_Capacity[i])
    #duration1.append(Duration[i])
        portion_prep = data

        portion_prep['Req_Portion']=Req_Portion1
        portion_prep['Portion_%_cap']=Portion_p_cap1
        portion_prep['Portion']=Portion1
        portion_prep['Portion_Capacity']=Portion_Capacity1
    #portion_prep['Duration']=duration1
    
    ### Pick Portion capacity and portion from previous lines for in between time intervals
        portion_data = portion_prep[portion_prep['portion_tag']=="P"][[ 'Flavor','Time','Portion','Req_Portion',
           'Portion_%_cap','Portion_Capacity','Duration']]

        portion_data['Pack size']="3kg"
        portion_data=portion_data.rename(columns={'Time':'End_Time'})
        portion_data['Start_Time'] = portion_data['End_Time'] - portion_data['Duration']
        portion_data['Actual_prod']=portion_data['Duration'] * portion_data['Portion_Capacity'] * ((portion_data['Portion_%_cap'].replace({'%': ''}, regex=True)).astype(int)*0.01)

        portion_data=portion_data[[ 'Flavor', 'Pack size', 'Start_Time','End_Time', 'Req_Portion','Portion','Portion_%_cap','Portion_Capacity','Actual_prod']]
    
    #Machines data preparation

        data_start=data[data['start/end'] == "start"][['Flavor','Pack size', 'Machine','Time','Capacity']]
        data_start=data_start.rename(columns={'Time':'Start_Time'})
        data_end=data[data['start/end'] == "end"][[ 'Flavor','Pack size', 'Machine','Time','Capacity']]
        data_end=data_end.rename(columns={'Time':'End_Time'})

        mc_data = pd.merge(data_start, data_end, how='left', on=['Flavor', 'Pack size','Machine','Capacity'])
        mc_data=mc_data.rename(columns={'Flavor_x':'Flavor'})
#mc_data.drop(labels = ['Flavor_y'], inplace=True, axis = 1)

        mc_data=mc_data[[ 'Flavor', 'Pack size','Machine','Start_Time','End_Time','Capacity']]
        mc_data['Actual_prod'] = mc_data['Capacity'] * (mc_data['End_Time']-mc_data['Start_Time'])

        mc_data['Portion_%_cap'] = "100%"
        mc_data['Req_Portion'] = 0
    
        portion_data=portion_data.rename(columns={'Portion':'Machine','Portion_Capacity':'Capacity'})
        portion_data = portion_data[[ 'Flavor', 'Pack size', 'Machine', 'Start_Time', 'End_Time',
           'Capacity', 'Actual_prod', 'Portion_%_cap', 'Req_Portion']]
        final_data = pd.concat([mc_data,portion_data], ignore_index=True, axis = 0)
        final_data=final_data.sort_values(by=['Start_Time'], ascending=True).reset_index(drop=True)
    
        production = final_data.groupby(['Flavor','Pack size'])['Actual_prod'].sum().reset_index()
        
        #############Adding Demand to Demand Gap Data#########
        #Number=string
        dem_file=file_3_1
        demand = production[['Flavor','Pack size']].drop_duplicates().reset_index()

    #Read Demand from demand matrix 
        dem_lst = []
        for i in range(len(demand)):
             dem_lst.append(dem_file.loc[production['Flavor'][i]][production['Pack size'][i]])
    
        demand['Demand'] = dem_lst
    
    # Demand gap after Heuristics
        demand_gap = pd.merge(production,demand, how='left', on = ['Flavor', 'Pack size'])
        demand_gap['GAP'] = demand_gap['Actual_prod']-demand_gap['Demand']
        demand_gap['GAP_%'] = (demand_gap['GAP']/demand_gap['Demand'])*100
        demand_gap.drop(labels = ['index'], inplace=True, axis = 1)
        demand_gap_he=demand_gap.copy()

        flav_dem_prod = demand_gap.groupby('Flavor').agg({'Actual_prod':'sum','Demand':'sum'}).reset_index()
        flav_dem_prod['GAP'] = flav_dem_prod['Actual_prod']-flav_dem_prod['Demand']
        flav_dem_prod['%']= (flav_dem_prod['GAP']/flav_dem_prod['Demand'])*100
        flav_dem_prod_he=flav_dem_prod.copy()
        return final_data,demand_gap

        
    
        #KPI - Determine the number of changeovers within a flavor for a given machine
    def KPI(final_data):
        Flavor = ['Base-Strawberry','Double-B&R','Double-G&P','Single-BC','Single-Green Tea','Single-Rose',
                  'Single-Vanilla','Single-Peach Olong','Single-Yoghurt']
        Flavor_F = ['f1','f2','f3','f4','f5','f6','f7','f8','f9']
        flav_df_1 = pd.DataFrame({"Flavor":Flavor_F,"Flavor-Name":Flavor},index=None)
        flav_m_co = final_data[[ 'Flavor', 'Pack size', 'Machine']]
        #Ignore Portions
        flav_m_co.drop(flav_m_co[flav_m_co['Pack size']== "3kg"].index,inplace=True)

        #Number of changeover
        flav_m_co = flav_m_co.groupby(['Flavor','Machine'], as_index = False).agg({'Pack size': 'count'})
        # flav_m_co = flav_m_co.groupby(['Flavor', 'Machine'], as_index = False).agg({'Pack size': 'count'})
        flav_m_co= flav_m_co.merge(flav_df_1,on =['Flavor'], how = "left")
        flav_m_co.rename(columns = {'Pack size': 'PS_cnt'}, inplace = True)
        flav_m_co['Change_over_count']=flav_m_co['PS_cnt']-1

        flav_m_co.drop(labels = ['PS_cnt'], inplace=True, axis = 1)

        flav_co = flav_m_co.groupby('Flavor', as_index = False)['Change_over_count'].sum()
        flav_co= flav_co.merge(flav_df_1,on =['Flavor'], how = "left")
        flav=flav_co[['Flavor','Flavor-Name','Change_over_count']]
        #------------------------------------#
        m_co = final_data.sort_values(by = ['Machine','Start_Time'], ascending=True).reset_index(drop=True)

        count =0
        setup=[]
        mc = []

        for mac in list(m_co['Machine'].unique()):
            machine = m_co[(~m_co['Machine'].str.contains("P")) & (m_co['Machine']==mac)].reset_index(drop=True)
            mc.append(mac)
            count = 0
            for i in range(len(machine)-1):
                if i == len(machine):
                    count = count
                elif machine['Pack size'][i]!=machine['Pack size'][i+1] and machine['Pack size'][i] == "116g" and machine['Pack size'][i+1] == "116g-f1":
                    count = count
                elif machine['Pack size'][i]!=machine['Pack size'][i+1]:
                    count+=1
            setup.append(count)
    
        setup_d = pd.DataFrame({'Machine':mc,"Setup_n":setup})
        #------------------------------#
        #KPI - Flavor Change over time 

        data_co_n = final_data[['Flavor','Pack size','Machine', 'Start_Time', 'End_Time']].sort_values(by=['Start_Time','End_Time'], ascending=True).reset_index(drop=True)
        data_co_n['Proc_time'] = data_co_n['End_Time'] - data_co_n['Start_Time']

        #Min
        flavor_min = data_co_n.groupby(['Flavor', 'Machine'], as_index = False).agg({'Start_Time': 'min'})
        flavor_min.rename(columns = {'Start_Time': 'fmin_time'}, inplace = True)
        data_co_n = pd.merge(data_co_n, flavor_min, how = 'left', on = ['Flavor', 'Machine'])

        #Max
        flavor_max = data_co_n.groupby(['Flavor'], as_index = False).agg({'End_Time': 'max'})
        flavor_max.rename(columns = {'End_Time': 'fmax_time'}, inplace = True)
        data_co_n = pd.merge(data_co_n, flavor_max, how = 'left', on = ['Flavor'])

        flavor_max_df = data_co_n[['Flavor', 'fmax_time']].drop_duplicates()
        flavor_max_df['Lag_maxtime'] = flavor_max_df['fmax_time'].shift(1)
        flavor_max_df['Lag_flavor'] = flavor_max_df['Flavor'].shift(1)
        flavor_max_df.drop(columns = ['fmax_time'], inplace = True)

        data_co_n = pd.merge(data_co_n, flavor_max_df, how = 'left', on = 'Flavor')
        data_co_n['start_end_diff'] = data_co_n['fmin_time'] - data_co_n['Lag_maxtime']

        data_co_n['f2f'] = data_co_n['Lag_flavor']+data_co_n['Flavor']

        #flavor Change over time calculation
        flavor_minimum = data_co_n.groupby(['Flavor'], as_index = False).agg({'Start_Time': 'min'})
        flavor_minimum.rename(columns = {'Start_Time': 'flavor_min_time'}, inplace = True)
        data_co_n = pd.merge(data_co_n, flavor_minimum, how = 'left', on = ['Flavor'])

        Flavor_change_over_time_1=data_co_n[['Flavor','Lag_flavor','f2f','flavor_min_time','Lag_maxtime']].drop_duplicates()
        Flavor_change_over_time_1['Flavor_change_over_time '] = Flavor_change_over_time_1['flavor_min_time'] - Flavor_change_over_time_1['Lag_maxtime']
        Flavor_change_over_time_1.reset_index(drop=True)

        Flavor_change_over_time_1.drop(labels = ['flavor_min_time','Lag_maxtime'], inplace=True, axis = 1)
    
        return flav,setup_d,Flavor_change_over_time_1
    
    def func12(final_data,Demand_gap,N,M):
        
        #wk_start_hrs=N
        threshold_3kg=M
        threshold_multiple_machines = 10
        up_limit = 0.1
        low_limit = 0.1
        low_limit_scn2 = 0.05  # Over production Cutting all ending jobs
        Demand_gap=Demand_gap.copy()
        Demand_gap_2 = Demand_gap[(Demand_gap['GAP_%']>=threshold_3kg) & (Demand_gap['Pack size'] == '3kg')]
        Demand_gap_2.reset_index(drop=True)
        a = Demand_gap_2['Flavor'].unique()
    
        #### Scenario 1: Shifting volume of P2 to P1 and changing ending time of other machines accordingly

        prod_plan = final_data
        if len(a) > 0:
            prod_plan_w1 = prod_plan[prod_plan['Flavor'].isin(a)].sort_values(['Start_Time'])

        #getting max end time for each machine for filtering
            machine_max = prod_plan_w1.groupby(['Flavor', 'Machine'],as_index = False).agg({'End_Time': 'max'})
            machine_max.rename(columns = {'End_Time': 'max_end_time'},inplace = True)

        #Filtering out max end time for each machine. 1 row for each machine
            prod_plan_w1 = pd.merge(prod_plan_w1, machine_max, on = ['Flavor', 'Machine'], how = 'left')
            prod_plan_w2 = prod_plan_w1[prod_plan_w1['End_Time'] == prod_plan_w1['max_end_time']]

            prod_plan_w1['max_tag'] = np.where(prod_plan_w1['End_Time'] == prod_plan_w1['max_end_time'], 1, 0)


            prod_plan_w1['time_diff'] = prod_plan_w1['End_Time'] - prod_plan_w1['Start_Time']
    #prod_plan_w1['overall_max_end_time'] = prod_plan_w1['max_end_time'].max()
            prod_plan_w1['overall_max_end_time'] = prod_plan_w1.groupby(['Flavor'], as_index = False)['max_end_time']#.transform(max)

            prod_plan_w1['opportunity'] = (prod_plan_w1['overall_max_end_time'] - prod_plan_w1['End_Time'])*prod_plan_w1['max_tag']
            prod_plan_w1['growth_opportunity'] = prod_plan_w1['opportunity'] * prod_plan_w1['max_tag']

            last_jobs = prod_plan_w1[prod_plan_w1['growth_opportunity'] > 0 ][['Flavor', 'Pack size', 'Machine', 'Capacity', 'growth_opportunity']]

    #### Defining upper and lower limit parameters
            Demand_gap['upper_limit'] = Demand_gap['Demand']*(1 + up_limit)
            Demand_gap['lower_limit'] = Demand_gap['Demand']*(1 - low_limit)
            Demand_gap['lower_limit_scn2'] = Demand_gap['Demand']*(1 - low_limit_scn2)

    # look into it : 3kg Packsize Demand upper limit can we fix at some level which will not impact to otherpacksize that much


    #Filtering only required flavors and removing 3KG as we don't have to check for that
            Demand_gap1 = Demand_gap[Demand_gap['Flavor'].isin(a)].reset_index()
            Demand_gap1 = Demand_gap1[Demand_gap1['Pack size'] != '3kg']

    ##Joining with last jobs to get estimated max and min time
            last_jobs1 = pd.merge(Demand_gap1, last_jobs, on = ['Flavor', 'Pack size'], how = 'left').dropna()

    #Estimating time required for other machines to excess extra production
            last_jobs1['gap'] = last_jobs1['upper_limit'] - last_jobs1['Actual_prod']
            last_jobs1['time_required'] = last_jobs1['gap']/last_jobs1['Capacity']
            last_jobs1['time_to_add'] = last_jobs1[['growth_opportunity', 'time_required']].min(axis = 1)

            last_job_time_add = last_jobs1.groupby('Flavor', as_index = False).agg({'time_to_add': 'min'})


    #Run only if last_job_time_add has some rows

            if last_job_time_add.shape[0] > 0:
                prod_plan_w2 = pd.merge(prod_plan_w1, last_job_time_add, on = ['Flavor'], how = 'left')

                prod_plan_w2['new_end_time'] = np.where(prod_plan_w2['opportunity'] > 0, prod_plan_w2['End_Time'] + prod_plan_w2['time_to_add'], prod_plan_w2['End_Time'])
                prod_plan_w2[['Flavor', 'Pack size', 'Machine', 'Start_Time', 'End_Time', 'new_end_time', 'opportunity']]

        #removing P2 Job for 3KG
                prod_plan_w3 = prod_plan_w2[~(~(prod_plan_w2['max_tag'] != 1) & 
                                        (prod_plan_w2['Pack size'] == '3kg') & 
                                        (prod_plan_w2['Machine'] == 'P2'))]

                prod_plan_w4 = prod_plan_w3[[ 'Flavor', 'Pack size', 'Machine', 'Start_Time', 'new_end_time', 'Capacity', 'Actual_prod', 'Portion_%_cap', 'Req_Portion','max_end_time','max_tag','overall_max_end_time']]

                prod_plan_w4.rename(columns = {'new_end_time': 'End_Time'}, inplace = True)
                prod_plan_w4['Actual_prod'] = (prod_plan_w4['End_Time'].astype(float) - prod_plan_w4['Start_Time'].astype(float)) * prod_plan_w4['Capacity'].astype(float) * (prod_plan_w4['Portion_%_cap'].str[:-1].astype(float)/100)

                prod_plan_out = prod_plan[~(prod_plan['Flavor'].isin(a))]
                prod_plan_out = prod_plan_out.append(prod_plan_w4)
            else:
                prod_plan_w1_else = prod_plan[~(prod_plan['Flavor'].isin(a))]
                prod_plan_out = prod_plan_w1.append(prod_plan_w1_else, ignore_index = True)

        else:
            prod_plan_out = prod_plan.copy()
        
    #Get updated demand and calculate ratio of updated production volume
        updated_demand = prod_plan_out.groupby(['Flavor', 'Pack size'], as_index = False).agg({'Actual_prod': 'sum'})

    #Calculating gap again with updated production values
        updated_demand1 = updated_demand.merge(Demand_gap[['Flavor', 'Pack size', 'Demand']], on = ['Flavor', 'Pack size'], how = 'left')
        updated_demand1['gap'] = (updated_demand1['Actual_prod'] - updated_demand1['Demand'])*100/updated_demand1['Demand']

    #Get updated demand and calculate ratio of updated production volume
        updated_demand = prod_plan_out.groupby(['Flavor', 'Pack size'], as_index = False).agg({'Actual_prod': 'sum'})

    #Calculating gap again with updated production values
        updated_demand1 = updated_demand.merge(Demand_gap[['Flavor', 'Pack size', 'Demand']], on = ['Flavor', 'Pack size'], how = 'left')
        updated_demand1['gap'] = (updated_demand1['Actual_prod'] - updated_demand1['Demand'])*100/updated_demand1['Demand']
    
    # flavor level
        flav_dem_prod = updated_demand1.groupby(['Flavor'], as_index = False).agg({'Actual_prod': 'sum','Demand':'sum'})

        flav_dem_prod['GAP'] = flav_dem_prod['Actual_prod']-flav_dem_prod['Demand']
        flav_dem_prod['%']= (flav_dem_prod['GAP']/flav_dem_prod['Demand'])*100
    # flav_dem_prod
        Demand_gap_2 = updated_demand1[(updated_demand1['gap']>=threshold_3kg) & (updated_demand1['Pack size'] == '3kg')]
        Demand_gap_2.reset_index(drop=True)
        a = Demand_gap_2['Flavor'].unique()
    
    #### Scenario 2: Multiple machines with overproduction case above a specific percentage. Reducing their time overall
    
        if len(a) > 0:
            prod_plan_w1 = prod_plan_out.copy()

            updated_demand1['over_tag'] = np.where(updated_demand1['gap'] >= threshold_multiple_machines, 1, 0)

            updated_demand1['over_tag'] = np.where(updated_demand['Pack size'] == '3kg', 0, updated_demand1['over_tag'])

            flavor_list = prod_plan_w1.Flavor.unique()

    # for i in flavor_list:

            pack_size_list = prod_plan_w1[(prod_plan_w1['Flavor'].isin(flavor_list)) & (prod_plan_w1['max_tag'] == 1)][['Pack size', 'Flavor']].drop_duplicates()
            pack_size_list['val'] = 1
    #Using demand and production tables from scenario 1
    # prod_plan_w1 = prod_plan[prod_plan['Flavor'].isin(a)].sort_values(['Start_Time'])
            prod_plan_s2w1 = prod_plan_w1.copy()

    #getting max end time for each machine for filtering
            prod_plan_s2w1 = pd.merge(pack_size_list, prod_plan_s2w1, on = ['Flavor', 'Pack size'], how = 'right')
            prod_plan_s2w1['val'] = prod_plan_s2w1['val'].fillna(0)

            machine_max = prod_plan_s2w1[prod_plan_s2w1['val'] == 1].groupby(['Flavor', 'Pack size'], as_index = False).agg({'End_Time': 'max'})
            machine_max.rename(columns = {'End_Time': 'max_end_time_machine'}, inplace = True)

            prod_plan_s2w2 = pd.merge(prod_plan_s2w1, machine_max[['Flavor', 'Pack size', 'max_end_time_machine']], on = ['Flavor', 'Pack size'], how = 'left')
            prod_plan_s2w2['max_machine_tag'] = np.where(prod_plan_s2w2['End_Time'] == prod_plan_s2w2['max_end_time_machine'], 1, 0)

    #Getting ending jobs
            prod_plan_s2w2['ending_job_tag'] = np.where((prod_plan_s2w2['max_tag'] == 1) & (prod_plan_s2w2['max_machine_tag'] == 1), 1, 0)
            ending_jobs = prod_plan_s2w2[prod_plan_s2w2['ending_job_tag'] == 1]

            demand_gap_scn2 = Demand_gap.reset_index(drop = True)

    #Production
            capacity_scn2 = ending_jobs.groupby(['Flavor', 'Pack size'], as_index = False).agg({'Capacity': 'sum'})

    #merging both to estimate time required
            demand_gap_scn2 = pd.merge(demand_gap_scn2, capacity_scn2, on = ['Flavor', 'Pack size'], how = 'left').dropna()

            demand_gap_scn2['max_time_reduce'] = (demand_gap_scn2['Actual_prod'] - demand_gap_scn2['lower_limit_scn2'])/demand_gap_scn2['Capacity']
    # demand_gap_scn2['zero_time_reduce'] = (demand_gap_scn2['Actual_prod'] - demand_gap_scn2['Demand'])/demand_gap_scn2['Capacity']

            to_reduce = demand_gap_scn2.groupby(['Flavor'], as_index = False).agg({'max_time_reduce': 'min'})

    ##Reducing time from actual schedule
            prod_plan_s2w4 = pd.merge(prod_plan, to_reduce, on = ['Flavor'], how = 'left')

            prod_plan_s2w4['max_time_reduce'] = prod_plan_s2w4['max_time_reduce'].fillna(0)
            prod_plan_s2w4['max_time_reduce'] = prod_plan_s2w4['max_time_reduce']*4
            prod_plan_s2w4['max_time_reduce'] = (prod_plan_s2w4['max_time_reduce'].round(0))/4


            prod_plan_s2w5 = pd.merge(prod_plan_s2w4, ending_jobs[['Flavor', 'Pack size', 'Machine', 'ending_job_tag', 'End_Time']], on = ['Flavor', 'Pack size', 'Machine', 'End_Time'], how = 'left')

            prod_plan_s2w5['ending_job_tag'] = prod_plan_s2w5['ending_job_tag'].fillna(0)

            prod_plan_out_scn2 = prod_plan_s2w5.copy()

            prod_plan_out_scn2['End_Time'] = np.where(prod_plan_out_scn2['ending_job_tag'] == 1, 
                                                 (prod_plan_out_scn2['End_Time'] - prod_plan_out_scn2['max_time_reduce']), 
                                                 prod_plan_out_scn2['End_Time'])

            prod_plan_out_scn3 = prod_plan_out_scn2[['Flavor', 'Pack size', 'Machine', 'Start_Time', 'End_Time', 'Capacity', 'Actual_prod', 'Req_Portion','Portion_%_cap']]
            prod_plan_out_scn3['Actual_prod'] = (prod_plan_out_scn3['End_Time'].astype(float) - prod_plan_out_scn3['Start_Time'].astype(float)) * prod_plan_out_scn3['Capacity'].astype(float) * (prod_plan_out_scn3['Portion_%_cap'].str[:-1].astype(float)/100)
        else:
            prod_plan_out_scn3 = prod_plan_out.copy()
        
        prod_plan_out_scn3 = prod_plan_out_scn3.drop_duplicates()       
    
    #Get updated demand and calculate ratio of updated production volume
        updated_demand = prod_plan_out_scn3.groupby(['Flavor', 'Pack size'], as_index = False).agg({'Actual_prod': 'sum'})

    #Calculating gap again with updated production values
        updated_demand1 = updated_demand.merge(Demand_gap[['Flavor', 'Pack size', 'Demand']], on = ['Flavor', 'Pack size'], how = 'left')
        updated_demand1['gap'] = (updated_demand1['Actual_prod'] - updated_demand1['Demand'])*100/updated_demand1['Demand']

    # flavor level
        flav_dem_prod = updated_demand1.groupby(['Flavor'], as_index = False).agg({'Actual_prod': 'sum','Demand':'sum'})

        flav_dem_prod['GAP'] = flav_dem_prod['Actual_prod']-flav_dem_prod['Demand']
        flav_dem_prod['%']= (flav_dem_prod['GAP']/flav_dem_prod['Demand'])*100
    
        file_co=func5()
    ##Scenario 2 F2F Mapping###########################
    ####################################################
        data_prep = prod_plan_out_scn3.copy()
    #Sorting needed to make robust
        data_prep=data_prep.sort_values(by=['Start_Time','End_Time'], ascending=True)
        data_prep.reset_index(drop=True)

#Min Start at Flavor Level
        flav_min = data_prep.groupby(['Flavor']).agg({'Start_Time': 'min'}).reset_index()
        flav_min.rename(columns = {'Start_Time':'Min_Time'}, inplace = True)

        data_prep=data_prep.merge(flav_min, on = ['Flavor'], how = "left")

#Max Start at Flavor Level
        flav_max = data_prep.groupby(['Flavor']).agg({'End_Time': 'max'}).reset_index()
        flav_max.rename(columns = {'End_Time':'Max_Time'}, inplace = True)

        data_prep_1=data_prep.merge(flav_max, on = ['Flavor'], how = "left")
#data_prep.head(8)

        flavor_max_df = data_prep_1[['Flavor', 'Max_Time']].drop_duplicates()
        flavor_max_df['Lag_maxtime'] = flavor_max_df['Max_Time'].shift(1)
        flavor_max_df['Lag_flavor'] = flavor_max_df['Flavor'].shift(1)
        flavor_max_df.drop(columns = ['Max_Time'], inplace = True)

        data_prep_1 = pd.merge(data_prep_1, flavor_max_df, how = 'left', on = 'Flavor')

        data_prep_1['diff'] = data_prep_1['Min_Time'] - data_prep_1['Lag_maxtime']
        data_prep_1['f2f'] = data_prep_1['Lag_flavor']+data_prep_1['Flavor'] 
#data_prep.head(8)

        data_prep_1 = pd.merge(data_prep_1, file_co, how = 'left', on = ['f2f', 'f2f'])
        data_prep_1.drop(columns = ['From','To'], inplace = True)

        data_prep_1['co_diff'] = data_prep_1['diff'] - data_prep_1['ChangeOver']

        co_diff_val = []
        count = 1

        for c in range(len(data_prep_1)):
            if count == 1:
                co_diff_val.append(0)
                count+=1
            elif data_prep_1['Flavor'][c]!=data_prep_1['Flavor'][c-1]:
                co_diff_val.append(data_prep_1['co_diff'][c])
            else:
                co_diff_val.append(0)
          
        data_prep_1['co_diff_val'] = co_diff_val

        data_prep_1['cumsum'] = data_prep_1['co_diff_val'].cumsum(axis = 0)

        data_prep_1['new_start_f2f'] = data_prep_1['Start_Time'] - data_prep_1['cumsum']
        data_prep_1['new_end_f2f'] = data_prep_1['End_Time'] - data_prep_1['cumsum']

        data_prep_1['Start_Time'] = data_prep_1['new_start_f2f']
        data_prep_1['End_Time'] = data_prep_1['new_end_f2f']

        data_prep_1.drop(labels = ['Min_Time','Lag_maxtime','Max_Time', 'Lag_flavor', 'diff', 'f2f', 'ChangeOver', 'co_diff',
           'co_diff_val', 'cumsum', 'new_start_f2f', 'new_end_f2f'], inplace=True, axis = 1)


# data_prep['Actual_prod']=(data_prep['End_Time']-data_prep['Start_Time'])*data_prep['Capacity'] # Portion % cap multiply
        data_prep_1['Actual_prod'] = (data_prep_1['End_Time'].astype(float) - data_prep_1['Start_Time'].astype(float)) * data_prep_1['Capacity'].astype(float) * (data_prep_1['Portion_%_cap'].str[:-1].astype(float)/100)

#Get updated demand and calculate ratio of updated production volume
        updated_demand = data_prep_1.groupby(['Flavor', 'Pack size'], as_index = False).agg({'Actual_prod': 'sum'})

   #Calculating gap again with updated production values
        updated_demand1 = updated_demand.merge(Demand_gap[['Flavor', 'Pack size', 'Demand']], on = ['Flavor', 'Pack size'], how = 'left')
        updated_demand1['gap'] = (updated_demand1['Actual_prod'] - updated_demand1['Demand'])*100/updated_demand1['Demand']
    
        return prod_plan_out_scn3,data_prep_1,updated_demand1
    
    def func13(data_prep,updated_demand1,I,J):
        wk_start_hrs=I
        threshold_3kg=10
        Kg_full_tank,Ratio,oven_cap,m1_m2_p_sum,section_cap,threshold_multiple_machines,up_limit,low_limit ,low_limit_scn2 ,underproduction_threshold ,up_limit_scn4,overproduction_pu=func1()
        prod_plan = data_prep.copy()
        capacity = prod_plan[['Machine','Pack size','Capacity', 'Flavor']].drop_duplicates(ignore_index=True)
        capacity.sort_values(by = ['Machine','Pack size'],inplace = True)
        Demand_gap_2 = updated_demand1
        Demand_gap_2['lowerlimit10'] = Demand_gap_2['Demand'] * underproduction_threshold
        Demand_gap_2['vol_to_inc'] = Demand_gap_2['lowerlimit10'] - Demand_gap_2['Actual_prod']
     
        #Deriving portion % for P1 to P2 move
        time_to_add_f1_p1p2 = (Demand_gap_2['vol_to_inc'] / (759.795 - 410.700))*4 #f1 - P2 capacity - P1 Capacity
        time_to_add_f1_p1p3 = (Demand_gap_2['vol_to_inc'] / (1930.290 - 410.700))*4 #f1 P3 capacity - P1 Capacity
        Time_to_add = (Demand_gap_2['vol_to_inc'] / (1930.29 - 759.795))*4 #P2 capacity - P1 Capacity
    
        time_to_add_f1_p2p3 = (Demand_gap_2['vol_to_inc'] / (1930.290 - 759.795))*4 #f1 - P2 capacity - P1 Capacity

#Adding columns
        Demand_gap_2['Time_to_add'] = Time_to_add.round(0)/4
        Demand_gap_2['time_to_add_f1_p1p2'] = time_to_add_f1_p1p2.round(0)/4
        Demand_gap_2['time_to_add_f1_p1p3'] = time_to_add_f1_p1p3.round(0)/4
    
        Demand_gap_2['time_to_add_f1_p2p3'] = time_to_add_f1_p2p3.round(0)/4
        Demand_gap_2 = Demand_gap_2[(Demand_gap_2['gap']<= -threshold_3kg) & (Demand_gap_2['Pack size'] == '3kg')].reset_index(drop=True)
    
        demand_gap_2_flavor_list = Demand_gap_2['Flavor'].unique()
        add_time = Demand_gap_2[['Flavor', 'Pack size','Time_to_add', 'time_to_add_f1_p1p3', 'time_to_add_f1_p1p2']].drop_duplicates()    
        a = Demand_gap_2['Flavor'].unique()
    
        if len(a) > 0:
        
        #filtering machine 2 and p1 only as we've built logic only for these. Cutting M2 jobs where P1 jobs are there
            mac_pack = ['Machine2', 'P1']
        
        #renaming 116g-f1 to 116g
            scn3_check_temp = prod_plan[prod_plan['Flavor'].isin(a)].copy()
            scn3_check_temp['Pack size'] = scn3_check_temp['Pack size'].replace({'116g-f1': '116g'})
        
        #Getting last job tag for jobs
            scn3_check_temp['max_end_time'] = scn3_check_temp.groupby(['Flavor'], as_index = False)['End_Time'].transform(max)
            scn3_check_temp['end_job_tag'] = np.where(scn3_check_temp['max_end_time'] == scn3_check_temp['End_Time'], 1, 0)
        
        #Getting ending pack size for each flavor with 3kg underproduction scenario
            ending_pack = scn3_check_temp[(scn3_check_temp['Machine'] == 'Machine1') & (scn3_check_temp['end_job_tag'] == 1)][['Pack size', 'Flavor']].drop_duplicates()
            ending_pack.rename(columns = {'Pack size': 'ending_pack_size'}, inplace = True)
        
        #filtering only these flavors for M2 as we can cut only these
            scn3_pack_check = scn3_check_temp[(scn3_check_temp['Flavor'].isin(a)) & (scn3_check_temp['Machine'].isin(mac_pack))]
            scn3_pack_check1 = pd.merge(scn3_pack_check, ending_pack, on = ['Flavor'], how = 'left')
        
            scn3_pack_check2 = scn3_pack_check1[~((scn3_pack_check1['Machine'] == 'Machine2') & (scn3_pack_check1['ending_pack_size'] != scn3_pack_check1['Pack size']))]
        
            scn3_pack_run_list = {}
        #running for flavors
            for k in a:
                ending_pack_run_list = np.unique(scn3_pack_check2[(scn3_pack_check2['Flavor'] == k) & (scn3_pack_check2['Machine'] == 'P1')]['Start_Time'].tolist() + scn3_pack_check2[(scn3_pack_check2['Flavor'] == k) & (scn3_pack_check2['Machine'] == 'P1')]['End_Time'].tolist())
                scn3_pack_check2_df = scn3_pack_check2[(scn3_pack_check2['Flavor'] == k) & (scn3_pack_check2['Machine'] == 'Machine2')]
                scn3_pack_run_list[k] = 0
                for i in range(len(ending_pack_run_list) - 1):
                    ep_st = ending_pack_run_list[i]
                    ep_en = ending_pack_run_list[i+1]
                
                    scn3_pack_check2_df['to_run_tag'] = np.where((scn3_pack_check2_df['Start_Time'] <= ep_st) & (scn3_pack_check2_df['End_Time'] >= ep_en), 1, 0)
                    scn3_pack_run_list[k] = max(scn3_pack_run_list[k], scn3_pack_check2_df['to_run_tag'].sum())
                
        
        #updating list a with new condition
            a_condition2 = list({k for k, v in scn3_pack_run_list.items() if v > 0})
        
            a = [x for x in a if x in a_condition2]
        else:
            scn3_pack_run_list = {}
        if (len(a) > 0) & (sum(scn3_pack_run_list.values()) > 0):
            prod_plan_wk = prod_plan[prod_plan['Flavor'].isin(a)].sort_values(['Start_Time'])
        
        #Logic to replace '116g-f1' by 116g only f1 flavor. Storing pack size in pack size dummy form
            for i in a:
                if i == 'f1':
                    prod_plan_wk['Pack size dummy'] = prod_plan_wk['Pack size'].copy()
                    dummy1 = prod_plan_wk[prod_plan_wk['Flavor'] == 'f1']
                    dummy1['Pack size'] = dummy1['Pack size'].replace({'116g-f1': '116g'})
    
                    prod_plan_wk = prod_plan_wk[prod_plan_wk['Flavor'] != 'f1'].append(dummy1)
        
        
        #getting max end time for each machine for filtering
            machine_max = prod_plan_wk.groupby(['Flavor', 'Machine'], as_index = False).agg({'End_Time': 'max'})
            machine_max.rename(columns = {'End_Time': 'max_end_time'}, inplace = True)
    
        #Filtering out max end time for each machine. 1 row for each machine
            prod_plan_wk = pd.merge(prod_plan_wk, machine_max, on = ['Flavor', 'Machine'], how = 'left')
        #prod_plan_wk2 = prod_plan_wk[prod_plan_wk['End_Time'] == prod_plan_wk['max_end_time']]
        #prod_plan_wk['max_tag'] = np.where(prod_plan_wk['End_Time'] == prod_plan_wk['max_end_time'], 1, 0)
    
            m1 = prod_plan_wk[prod_plan_wk['Machine']=="Machine1"][['Flavor','Machine','Pack size','End_Time']]
            m2 = prod_plan_wk[prod_plan_wk['Machine']=="Machine2"][['Flavor','Machine','Pack size','End_Time']]
            m1 = m1.rename(columns = {'End_Time':'End_Time_m1','Machine':'Machine_m1'})
            m2 = m2.rename(columns = {'End_Time':'End_Time_m2','Machine':'Machine_m2'})
    
            machine_check = pd.merge(m1,m2, on = ['Flavor','Pack size'], how = 'left')
    
            flav = machine_check[(machine_check['End_Time_m1']==machine_check['End_Time_m2'])]['Flavor'].unique()
            target_flav_prod = prod_plan[prod_plan['Flavor'].isin(flav)]
        
            target_flav_prod = pd.merge(target_flav_prod, add_time, on = ['Flavor','Pack size'],how='left')
            target_flav_prod['Processing_Time'] = (target_flav_prod['End_Time'] - target_flav_prod['Start_Time']).fillna(0)*4
            target_flav_prod['Processing_Time'] = target_flav_prod['Processing_Time'].round(0)/4
    
            target_flav_prod['Remaining_Time'] = target_flav_prod['Time_to_add'] - target_flav_prod['Processing_Time']
            min_start_time= target_flav_prod.groupby(['Flavor', 'Pack size', 'Machine'], as_index = False).agg({'Start_Time': 'min'})
            min_start_time.rename(columns = {'Start_Time': 'min_start_time'}, inplace = True)
    
            target_flav_prod1 = pd.merge(target_flav_prod, min_start_time, on = ['Flavor', 'Pack size', 'Machine'], how = 'left')
            target_flav_prod1['rank'] = np.where(target_flav_prod1['Start_Time'] == target_flav_prod1['min_start_time'], 1, 0)
    
        #Logic to estimate remaining time
            target_flav_prod1['Remaining_Time'] = target_flav_prod1['Remaining_Time'].fillna(0)
            target_flav_prod1['rem_time'] = 0.0
    
    #     target_flav_prod2 = target_flav_prod1[target_flav_prod1['Machine'] == 'P1'].reset_index(drop = True)
        
        #creating target_flav_prod2 dataframe with P1 and P2 only if there is no P1 for f1
            if ('P1' not in target_flav_prod1[target_flav_prod1['Flavor'] == 'f1']['Machine'].unique()):
            
                target_flav_prod2 = target_flav_prod1[(target_flav_prod1['Machine'] == 'P2') & (target_flav_prod1['Flavor'] == 'f1')]
                target_flav_prod2_tempdf = target_flav_prod1[(target_flav_prod1['Flavor'] != 'f1') & (target_flav_prod1['Machine'] == 'P1')]
            
                target_flav_prod2 = target_flav_prod2.append(target_flav_prod2_tempdf, ignore_index = True)
    
            else:
                target_flav_prod2 = target_flav_prod1[target_flav_prod1['Machine'] == 'P1'].reset_index(drop = True)
    
    ####Commenting out old code
    #     for i in range(target_flav_prod2.shape[0]):
    #         if target_flav_prod2['rank'][i] == 1:
    #             if (target_flav_prod2['Time_to_add'][i] < target_flav_prod2['Processing_Time'][i]) & (target_flav_prod2['Time_to_add'][i] > 0):
    #                 target_flav_prod2['rem_time'][i] = 0
    #             else:
    #                 target_flav_prod2['rem_time'][i] = target_flav_prod2['Time_to_add'][i] - target_flav_prod2['Processing_Time'][i]
    #         else:
    #             target_flav_prod2['rem_time'][i] = target_flav_prod2['rem_time'][i-1] - target_flav_prod2['Processing_Time'][i]
    ####
    
            target_flav_prod2['rem_time'] = 0.0
            target_flav_prod2['rem_time1'] = 0.0
            target_flav_prod2['rem_time2'] = 0.0
         
            def fn_rem_time(df, add_col, f1_add_col1, f1_add_col2):
                for i in range(df.shape[0]):
    
                #f1 logic. Calculating for both p1 to p2 and p1 to p3
                    if df['Flavor'][i] == 'f1':
                        if df['rank'][i] == 1:
    
                        #p1 to p2 code
                            if (df[f1_add_col1][i] < df['Processing_Time'][i]) & (df[f1_add_col1][i] > 0):
                                df['rem_time1'][i] = 0
                            else:
                                df['rem_time1'][i] = df[f1_add_col1][i] - df['Processing_Time'][i]
    
                        #p1 to p3 code
                            if (df[f1_add_col2][i] < df['Processing_Time'][i]) & (df[f1_add_col2][i] > 0):
                                df['rem_time2'][i] = 0
                            else:
                                df['rem_time2'][i] = df[f1_add_col2][i] - df['Processing_Time'][i]
    
                        else:
                            df['rem_time'][i] = df['rem_time'][i-1] - df['Processing_Time'][i]
                            df['rem_time1'][i] = df['rem_time1'][i-1] - df['Processing_Time'][i]
                            df['rem_time2'][i] = df['rem_time2'][i-1] - df['Processing_Time'][i]
    
                #other flavors
                    else:
                        if df['rank'][i] == 1:
                            if (df[add_col][i] < df['Processing_Time'][i]) & (df[add_col][i] > 0):
                                df['rem_time'][i] = 0
                            else:
                                df['rem_time'][i] = df[add_col][i] - df['Processing_Time'][i]
                        else:
                            df['rem_time'][i] = df['rem_time'][i-1] - df['Processing_Time'][i]
    
                return df
    
            target_flav_prod2 = fn_rem_time(df = target_flav_prod2, add_col = 'Time_to_add', f1_add_col1 = 'time_to_add_f1_p1p2', f1_add_col2 ='time_to_add_f1_p1p3')
            target_flav_prod2['replace_portion'] = 'P2'
        
            if 'f1' in a:
            #Checking if remaining time as per P3 capacity is sufficing need. If yes then we write it in rem_time column
                if target_flav_prod2[target_flav_prod2['rem_time2'] >= 0].shape[0] > 0:
                    target_flav_prod2['replace_portion'] = np.where(target_flav_prod2['Flavor'] == 'f1', 'P3', 'P2')
                    target_flav_prod2['rem_time'] = np.where(target_flav_prod2['Flavor'] == 'f1', target_flav_prod2['rem_time2'], target_flav_prod2['rem_time'])
    
            #else we'll write P2's values
                else:
                    target_flav_prod2['rem_time'] = np.where(target_flav_prod2['Flavor'] == 'f1', target_flav_prod2['rem_time1'], target_flav_prod2['rem_time'])
        
    
    
            target_flav_prod2['new_machine'] = np.where(target_flav_prod2['rem_time'] >= 0, target_flav_prod2['replace_portion'], target_flav_prod2['Machine'])
    
            switches = target_flav_prod2[target_flav_prod2['Machine'] != target_flav_prod2['new_machine']][['Flavor', 
                                                                                                        'Pack size',
                                                                                                        'Machine', 
                                                                                                        'new_machine',
                                                                                                        'Start_Time', 
                                                                                                        'End_Time', 
                                                                                                        'Processing_Time', 
                                                                                                        'replace_portion']]
    
            target_flav_prod2['Machine'] = target_flav_prod2['new_machine']
        
        #Creating dataframe to use it for future usage where we'll add extend ending jobs
            p1_replacement = target_flav_prod2[['Flavor', 'replace_portion']].drop_duplicates()
    
            target_flav_prod2.drop(columns = ['new_machine', 'rem_time', 'rem_time1', 'rem_time2', 'time_to_add_f1_p1p3', 'time_to_add_f1_p1p2', 'replace_portion'], inplace = True)
            target_flav_prod1.drop(columns = ['rem_time'], inplace = True)
    
        #Merging results both P1 and non P1 ones
            updated_schedule = target_flav_prod1[target_flav_prod1['Flavor'] != 'P1'].reset_index(drop = True).append(target_flav_prod2.reset_index(drop = True)).reset_index(drop = True).drop_duplicates()
            #updated_schedule = updated_schedule[['Flavor_n', 'Flavor', 'Pack size', 'Machine', 'Start_Time', 'End_Time', 'Capacity', 'Actual_prod', 'Portion_%_cap', 'Req_Portion','Time_to_add', 'rank']].drop_duplicates()
            updated_schedule = updated_schedule[['Flavor', 'Pack size', 'Machine', 'Start_Time', 'End_Time', 'Capacity', 'Actual_prod', 'Portion_%_cap', 'Req_Portion','Time_to_add', 'rank']].drop_duplicates()
    
    ####Adding code for scneario 5####
    
        scn5_a = updated_demand1[(updated_demand1['Pack size'] == '3kg') & (updated_demand1['gap'] < (- low_limit * 100))]['Flavor'].unique()
    
        if len(scn5_a) > 0:
            scn5_1 = prod_plan[prod_plan['Flavor'].isin(scn5_a)]
        
            machines = ['Machine1', 'Machine2']
        #checking if m1 and m2 don't end together
            scn5_1['dummy_pack_size'] = np.where(scn5_1['Pack size'] == '116g-f1', '116g', scn5_1['Pack size']) #'116g-f1': '116g'
        
            m_end = scn5_1[scn5_1['Machine'].isin(machines)].groupby(['Flavor', 'Machine'], as_index = False).agg({'End_Time': 'max'})
    #     m_end.rename(columns = {'dummy_pack_size': 'Pack size'}, inplace = True)
        
            m_end['max_end'] = m_end.groupby(['Flavor'], as_index = False)['End_Time'].transform(max)
            m_end['run_tag'] = np.where(m_end['End_Time'] == m_end['max_end'], 0, 1)
            m_end1 = m_end.groupby(['Flavor'], as_index = False).agg({'run_tag': 'sum'})
        
        #getting last job and it's pack size
            scn5_1['flav_end_time'] = scn5_1.groupby(['Flavor'], as_index = False)['End_Time'].transform(max)
            scn5_1['last_job'] = np.where(scn5_1['flav_end_time'] == scn5_1['End_Time'], 1, 0)
        
            scn5_ending_packs = scn5_1[(scn5_1['Machine'] == 'Machine1') & (scn5_1['last_job'] == 1)][['Flavor', 'Pack size']].drop_duplicates()
            scn5_ending_packs.rename(columns = {'Pack size': 'm1_ending_pack'}, inplace = True)
            scn5_m1ending_packs = scn5_ending_packs[['Flavor', 'm1_ending_pack']].drop_duplicates().copy()
        
            flav_scn5 = m_end1[m_end1['run_tag'] > 0]['Flavor'].unique()
            
            m2_ending_packs = pd.merge(scn5_1[scn5_1['Flavor'].isin(flav_scn5)], scn5_ending_packs, on = ['Flavor'], how = 'left')
            m2_ending_packs1 = m2_ending_packs[(m2_ending_packs['Pack size'] == m2_ending_packs['m1_ending_pack']) & (m2_ending_packs['Machine'] == 'Machine2')]
            m2_ending_packs2 = m2_ending_packs1[['Flavor', 'Pack size', 'Machine', 'Start_Time', 'End_Time']]
            m2_ending_packs2.rename(columns = {'Start_Time': 'start_m1', 'End_Time': 'end_m1'}, inplace = True)
            m2_ending_packs4 = m2_ending_packs2[['Flavor', 'start_m1', 'end_m1']].drop_duplicates()
        
            scn5_1_m1 = pd.merge(scn5_1, m2_ending_packs4, on = ['Flavor'], how = 'left')
            scn5_1_m1['m1_overlap_tag'] = np.where((scn5_1_m1['Start_Time'] >= scn5_1_m1['start_m1']) & (scn5_1_m1['End_Time'] <= scn5_1_m1['end_m1']), 1, 0)
        
            scn5_1_m2 = scn5_1_m1.groupby(['Flavor', 'Pack size', 'Start_Time', 'End_Time', 'Machine'], as_index = False).agg({'m1_overlap_tag': 'sum'})
        
        #Tagging rows where only last pack size timings are availables for M2
    #     time_list = np.unique(scn5_1['Start_Time'].tolist() + scn5_1['End_Time'].tolist())
        
    #         for i in range(len(time_list) - 1):
    #             st5 = time_list[i]
    #             en5 = time_list[i]
    
    
        
        #Only if m_end1 is > 0 for any flavor then we'll run
            if (m_end1['run_tag'].sum() > 0):
    
                scn5_1 = pd.merge(scn5_1[scn5_1['Flavor'].isin(flav_scn5)], add_time, on = ['Flavor','Pack size'], how = 'left')
                scn5_1['Processing_Time'] = (scn5_1['End_Time'] - scn5_1['Start_Time']).fillna(0)*4
                scn5_1['Processing_Time'] = scn5_1['Processing_Time'].round(0)/4
    
                scn5_1['Remaining_Time'] = scn5_1['Time_to_add'] - scn5_1['Processing_Time']
     
                min_start_time_scn5 = scn5_1.groupby(['Flavor', 'Pack size', 'Machine'], as_index = False).agg({'Start_Time': 'min'})
                min_start_time_scn5.rename(columns = {'Start_Time': 'min_start_time'}, inplace = True)
    
                scn5_11 = pd.merge(scn5_1, min_start_time_scn5, on = ['Flavor', 'Pack size', 'Machine'], how = 'left')
                scn5_11['rank'] = np.where(scn5_11['Start_Time'] == scn5_11['min_start_time'], 1, 0)
    
            #Logic to estimate remaining time
                scn5_11['Remaining_Time'] = scn5_11['Remaining_Time'].fillna(0)
                scn5_11['rem_time'] = 0.0
    
            #Filtering jobs with P1 only
                scn5_12 = scn5_11[scn5_11['Machine'] == 'P1'].reset_index(drop = True)
                scn5_12 = pd.merge(scn5_12, scn5_1_m2, on = ['Flavor', 'Pack size', 'Machine', 'Start_Time', 'End_Time'], how = 'left')
                scn5_12 = scn5_12[scn5_12['m1_overlap_tag'] == 1]
    
            #creating run time cols
                scn5_12['rem_time'] = 0.0
                scn5_12['rem_time1'] = 0.0
                scn5_12['rem_time2'] = 0.0
    
                scn5_12 = fn_rem_time(df = scn5_12, add_col = 'Time_to_add', f1_add_col1 = 'time_to_add_f1_p1p2', f1_add_col2 ='time_to_add_f1_p1p3')
                scn5_12['replace_portion'] = 'P2'
    
                if 'f1' in a:
                #Checking if remaining time as per P3 capacity is sufficing need. If yes then we write it in rem_time column
                    if scn5_12[scn5_12['rem_time2'] >= 0].shape[0] > 0:
                        scn5_12['replace_portion'] = np.where(scn5_12['Flavor'] == 'f1', 'P3', 'P2')
                        scn5_12['rem_time'] = np.where(scn5_12['Flavor'] == 'f1', scn5_12['rem_time2'], scn5_12['rem_time'])
    
                #else we'll write P2's values
                    else:
                        scn5_12['rem_time'] = np.where(scn5_12['Flavor'] == 'f1', scn5_12['rem_time1'], scn5_12['rem_time'])
    
                scn5_12['new_machine'] = np.where(scn5_12['rem_time'] >= 0, scn5_12['replace_portion'], scn5_12['Machine'])
    
                switches_scn5 = scn5_12[scn5_12['Machine'] != scn5_12['new_machine']][['Flavor',
                                                                             'Pack size',
                                                                            'Machine', 
                                                                            'new_machine',
                                                                            'Start_Time', 
                                                                            'End_Time', 
                                                                            'Processing_Time', 
                                                                            'replace_portion']]
                switches_scn5['scn5'] = 1
    
                scn5_12['Machine'] = scn5_12['new_machine']
    
            #Creating dataframe to use it for future usage where we'll add extend ending jobs
                p1_replacement_scn5 = scn5_12[['Flavor', 'replace_portion']].drop_duplicates()
    
    #         scn5_12.drop(columns = ['new_machine', 'rem_time', 'rem_time1', 'rem_time2', 'time_to_add_f1_p1p3', 'time_to_add_f1_p1p2', 'replace_portion'], inplace = True)
    #         scn5_11.drop(columns = ['rem_time'], inplace = True)
                #Merging results both P1 and non P1 ones
                scn5_updated_sch = scn5_11[scn5_1['Flavor'] != 'P1'].reset_index(drop = True).append(scn5_12.reset_index(drop = True)).reset_index(drop = True).drop_duplicates()
                scn5_updated_sch = scn5_updated_sch[['Flavor', 'Pack size', 'Machine', 'Start_Time', 'End_Time', 'Capacity', 'Actual_prod', 'Portion_%_cap', 'Req_Portion','Time_to_add', 'rank']].drop_duplicates()
                scn5_flavor_fn_list = scn5_updated_sch['Flavor'].unique()
            
    #### scenario 5 code end s####
    
    #### merging output of both scenario 3 and scenario 5 ####
        if (len(a) > 0) & (sum(scn3_pack_run_list.values()) > 0):
        
            if (m_end1['run_tag'].sum() > 0):
    
                updated_schedule = updated_schedule.append(scn5_updated_sch, ignore_index = True)
                switches = switches.append(switches_scn5, ignore_index = True)
                p1_replacement = p1_replacement.append(p1_replacement_scn5, ignore_index = True)
    
    
    
    #### merging scenarios code ends ####
            switches['p1_switch'] = 1
            flavor_list_m2update = updated_schedule['Flavor'].unique()
        
            updated_schedule = pd.merge(updated_schedule, switches[['Flavor', 'Pack size', 'Machine', 'Start_Time', 'End_Time', 'p1_switch']].drop_duplicates(), on = ['Flavor', 'Pack size', 'Machine', 'Start_Time', 'End_Time'], how = 'left')
    
            updated_schedule_cn = updated_schedule[~((updated_schedule['Flavor'].isin(flavor_list_m2update)) & (updated_schedule['Machine'] == 'Machine2'))]
        #updated_schedule_onlym2 = updated_schedule[((updated_schedule['Flavor'].isin(scn5_flavor_fn_list)) & (updated_schedule['Machine'] == 'Machine2'))]
        
        #Creating blank df to store updated df fields
            m2_df = pd.DataFrame(columns = ["Flavor", "Pack size", "Machine", "Start_Time", "End_Time", "Capacity", "Portion_%_cap"])
        ##Flavor_n
            if len(flavor_list_m2update) > 0:
                for i in flavor_list_m2update:
    
                    t = updated_schedule[(updated_schedule['Flavor'] == i) & (updated_schedule['Machine'].isin(['Machine2', 'P1']))]
                    out_list = t['Start_Time'].unique().tolist() + t['End_Time'].unique().tolist()
                    out_list.sort()
    
                    m2_jobs = updated_schedule[(updated_schedule['Flavor'] == i) & (updated_schedule['Machine'] == 'Machine2')].reset_index(drop = True)
                    p1_jobs = updated_schedule[(updated_schedule['Flavor'] == i) & (updated_schedule['Machine'] == 'P1') & (updated_schedule['p1_switch'] == 1)].reset_index(drop = True)
    
                    for j in range(len(out_list)-1):
                        st = out_list[j]
                        en = out_list[j+1]
    
                    #Evaluating if ranges lie in M2 jobs or not
                        m2_jobs['run_tag'] = np.where((m2_jobs['Start_Time'] <= st) & (m2_jobs['End_Time'] >= en), 1, 0)
    
                    #Checking if ranges don't lie in P1 jobs
                        p1_jobs['run_tag'] = np.where((p1_jobs['Start_Time'] <= st) & (p1_jobs['End_Time'] >= en), 0, 1)
    
                        if ((m2_jobs['run_tag'].sum() >= 1) & (p1_jobs['run_tag'].sum() == p1_jobs.shape[0])):
                        
                            pack_to_write = m2_jobs[((m2_jobs['Start_Time'] <= st) & (m2_jobs['End_Time'] >= en))]['Pack size'].unique()
                        
                            temp = pd.DataFrame({"Flavor": m2_jobs['Flavor'][0], "Flavor": i, "Pack size": pack_to_write[0], "Machine": 'Machine2', "Start_Time": st, "End_Time": en, "Capacity": m2_jobs['Capacity'][0], "Portion_%_cap": '100%'}, index = [0])
                            updated_schedule_cn = updated_schedule_cn.append(temp)
                        else:
                            pass
            else:
                #updated_schedule_cn = updated_schedule[['Flavor_n', 'Flavor', 'Pack size', 'Machine', 'Start_Time', 'End_Time', 'Capacity', 'Actual_prod', 'Portion_%_cap', 'Req_Portion','Time_to_add', 'rank']].drop_duplicates().copy()
                updated_schedule_cn = updated_schedule[[ 'Flavor', 'Pack size', 'Machine', 'Start_Time', 'End_Time', 'Capacity', 'Actual_prod', 'Portion_%_cap', 'Req_Portion','Time_to_add', 'rank']].drop_duplicates().copy()
            if updated_schedule_cn.shape[0] > 0:
            ## Handling M1, M2 schedule
            # updated_schedule_cn.groupby(['Flavor', 'Machine'], as_index = False).agg({'End_Time': 'max'})
    
                machines_to_extend = ['Machine1', 'Machine2', 'P2', 'P3']
    
            #Getting max end at flavor level (not at flavor and machine level)
                updated_schedule_cn['max_end_time'] = updated_schedule_cn.groupby(['Flavor'], as_index = False)['End_Time'].transform(max)
                updated_schedule_cn['last_job_tag'] = np.where((updated_schedule_cn['End_Time'] == updated_schedule_cn['max_end_time']) & (updated_schedule_cn['Machine'].isin(machines_to_extend)), 1, 0)
    
            #Getting time by which we should be extending M1 and M2 last jobs
    
            ####old code
            # extend_df = switches.groupby(['Flavor'], as_index = False).agg({'Processing_Time': 'sum'})
            # extend_df.rename(columns = {'Processing_Time': 'time_to_extend'}, inplace = True)
            # extend_df['time_to_extend'] = extend_df['time_to_extend']/2
            ####
            
            #Logic to determine time of extension based on time reduced for Machine2
                updated_schedule_extend1 = updated_schedule[updated_schedule['Machine'] == 'Machine2'].copy()
                updated_schedule_extend2 = updated_schedule_cn[updated_schedule_cn['Machine'] == 'Machine2'].copy()
    
                updated_schedule_extend1['total_time1'] = updated_schedule_extend1['End_Time'] - updated_schedule_extend1['Start_Time']
                updated_schedule_extend2['total_time2'] = updated_schedule_extend2['End_Time'] - updated_schedule_extend2['Start_Time']
    
                updated_e1 = updated_schedule_extend1.groupby(['Flavor'], as_index = False).agg({'total_time1': 'sum'})
                updated_e2 = updated_schedule_extend2.groupby(['Flavor'], as_index = False).agg({'total_time2': 'sum'})
    
                updated_extend = pd.merge(updated_e1, updated_e2, on = 'Flavor', how = 'left')
                updated_extend['time_to_extend'] = (updated_extend['total_time1'] - updated_extend['total_time2'].fillna(0))/2
    
                extend_df = updated_extend[['Flavor', 'time_to_extend']]
    
                extend_df['time_to_extend'] = ((extend_df['time_to_extend']*4).round(0))/4
    
                updated_schedule_cn1 = pd.merge(updated_schedule_cn, extend_df, on = ['Flavor'], how = 'left')
    
            #Time to extend for last jobs
                updated_schedule_cn1['new_end_time'] = np.where((updated_schedule_cn1['last_job_tag'] == 1), 
                                                         updated_schedule_cn1['End_Time'] + updated_schedule_cn1['time_to_extend'], 
                                                         updated_schedule_cn1['End_Time'])
    
            #Checking if P2 job is been added or not. Else one last job would be added manually
                max_et_ov = updated_schedule_cn1.groupby(['Flavor'], as_index = False).agg({'new_end_time': 'max', 'max_end_time': 'mean', 'time_to_extend': 'mean'})
                max_et_ov.rename(columns = {'new_end_time': 'max_et_ov'}, inplace = True)
            
            #using p1_replacement dataframe to dynamically filter out P2 or P3 jobs
                dynamic_portion = updated_schedule_cn1.copy()
                dynamic_portion1 = pd.merge(dynamic_portion, p1_replacement, on = ['Flavor'], how = 'left')
                dynamic_portion1['replace_portion_tag'] = np.where(dynamic_portion1['Machine'] == dynamic_portion1['replace_portion'], 1, 0)
            
                max_et_p2 = dynamic_portion1[dynamic_portion1['replace_portion_tag'] == 1].groupby(['Flavor'], as_index = False).agg({'new_end_time': 'max'})
                max_et_p2.rename(columns = {'new_end_time': 'max_et_p2'}, inplace = True)
                max_et_p2['max_et_p2'] = max_et_p2['max_et_p2'].fillna(0)
    
                max_et = pd.merge(max_et_ov, max_et_p2, on = ['Flavor'], how = 'left')
                max_et['max_et_p2'] = max_et['max_et_p2'].fillna(0)
            
            #Updating End_Time column
                updated_schedule_cn1['End_Time'] = updated_schedule_cn1['new_end_time']
            
            #Creating blank dataframe which will have appended rows
                appended_df = pd.DataFrame(columns = [ 'Flavor', 'Pack size', 'Machine', 'Start_Time', 'End_Time', 'Capacity', 'Portion_%_cap'])
            
            #Updating cells only when end time of P2 won't match with end time of flavor
                if max_et.shape[0] > 0:
                    for i in range(max_et.shape[0]):
                        if (max_et['max_et_ov'][i] != max_et['max_et_p2'][i]):
                            temp = pd.DataFrame({"Flavor": max_et['Flavor'][i], "Flavor": max_et['Flavor'][i], "Pack size": '3kg', "Machine": "max_et['replace_portion'][i]", "Start_Time": max_et['max_end_time'][i], "End_Time": max_et['max_end_time'][i] + max_et['time_to_extend'][i], "Capacity": 1930.29, "Portion_%_cap": '100%'}, index = [0])
                            updated_schedule_cn1 = updated_schedule_cn1.append(temp, ignore_index = True)
                        
                        #Appending rows in appended_df
                            appended_df = appended_df.append(temp, ignore_index = True)
                            print(temp)
                        else:
                            pass
                else:
                    pass
            
            ####Scenario 5: logic to update M2 jobs if it's not ending with M1####
                if len(flav_scn5) > 0:
                    max_et_m2 = dynamic_portion1[dynamic_portion1['Machine'] == 'Machine2'].groupby(['Flavor'], as_index = False).agg({'new_end_time': 'max'})
                    max_et_m2.rename(columns = {'new_end_time': 'max_et_m2'}, inplace = True)
                    max_et_m2['max_et_m2'] = max_et_m2['max_et_m2'].fillna(0)
    
                    max_et1 = pd.merge(max_et_ov, max_et_m2, on = ['Flavor'], how = 'left')
                    max_et1['max_et_m2'] = max_et1['max_et_m2'].fillna(0)
                    max_et1 = max_et1[max_et1['Flavor'].isin(flav_scn5)]
    
                #Updating cells only when end time of M2 won't match with end time of flavor
                    if max_et1.shape[0] > 0:
                        for i in range(max_et1.shape[0]):
                            if (max_et1['max_et_ov'][i] != max_et1['max_et_m2'][i]):
                                temp = pd.DataFrame({"Flavor": max_et1['Flavor'][i], "Flavor": max_et1['Flavor'][i], "Pack size": scn5_m1ending_packs[scn5_m1ending_packs['Flavor'] == max_et1['Flavor'][i]].reset_index()['m1_ending_pack'][0], "Machine": 'Machine2', "Start_Time": max_et['max_end_time'][i], "End_Time": max_et['max_end_time'][i] + max_et['time_to_extend'][i], "Capacity": 1930.29, "Portion_%_cap": '100%'}, index = [0])
                                updated_schedule_cn1 = updated_schedule_cn1.append(temp, ignore_index = True)
    
                            #Appending rows in appended_df
                                appended_df = appended_df.append(temp, ignore_index = True)
    
            ####Scneario 5 m2 update logic ends####
    
            
                prod_plan_remaining = prod_plan[~(prod_plan['Flavor'].isin(flavor_list_m2update))]        
                prod_plan_scn3_updated = updated_schedule_cn1[['Flavor', 'Pack size', 'Machine', 'Start_Time', 'End_Time', 'Capacity', 'Actual_prod', 'Portion_%_cap', 'Req_Portion']].copy()
                prod_plan_scn3_out = prod_plan_remaining.append(prod_plan_scn3_updated)
            
                switches['remove_tag'] = 1
                prod_plan_scn4_out = pd.merge(prod_plan_scn3_out, switches[['Flavor', 'Pack size', 'Machine', 'remove_tag', 'Start_Time', 'End_Time']], on = ['Flavor', 'Pack size', 'Machine', 'Start_Time', 'End_Time'], how = 'left')
                prod_plan_scn4_out['remove_tag'] = prod_plan_scn4_out['remove_tag'].fillna(0)
                prod_plan_scn4_out = prod_plan_scn4_out[prod_plan_scn4_out['remove_tag'] != 1]
            
            #Rewriting capacity values
                prod_plan_scn4_out.drop(columns = {'Capacity'}, inplace = True)
                prod_plan_scn4_out = pd.merge(prod_plan_scn4_out, capacity, on = ['Flavor', 'Pack size', 'Machine'], how = 'left').drop_duplicates()
    
            else:
                updated_schedule_cn1 = updated_schedule.copy()
                prod_plan_remaining = prod_plan[~(prod_plan['Flavor'].isin(flavor_list_m2update))]
                prod_plan_scn3_updated = updated_schedule_cn1[['Flavor', 'Pack size', 'Machine', 'Start_Time', 'End_Time', 'Capacity', 'Actual_prod', 'Portion_%_cap', 'Req_Portion']].copy()
                prod_plan_scn3_out = prod_plan_remaining.append(prod_plan_scn3_updated)
                switches['remove_tag'] = 1
                prod_plan_scn4_out = pd.merge(prod_plan_scn3_out, switches[['Flavor', 'Pack size', 'Machine', 'remove_tag', 'Start_Time', 'End_Time']], on = ['Flavor', 'Pack size', 'Machine', 'Start_Time', 'End_Time'], how = 'left')
                prod_plan_scn4_out['remove_tag'] = prod_plan_scn4_out['remove_tag'].fillna(0)
                prod_plan_scn4_out = prod_plan_scn4_out[prod_plan_scn4_out['remove_tag'] != 1]
            
            #Rewriting capacity values
                prod_plan_scn4_out.drop(columns = {'Capacity'}, inplace = True)
                prod_plan_scn4_out = pd.merge(prod_plan_scn4_out, capacity, on = ['Flavor', 'Pack size', 'Machine'], how = 'left').drop_duplicates()
             
        else:
            prod_plan_scn4_out = prod_plan.copy()
        #### Portion percentage update code   
        prod_plan_scn4_out = prod_plan_scn4_out[prod_plan_scn4_out['Start_Time'] != prod_plan_scn4_out['End_Time']]
        portions_list = ['P1', 'P2', 'P3']
    
        if len(a) > 0:
        
            prod_plan_scn4_out_temp = prod_plan_scn4_out[(prod_plan_scn4_out['Flavor'].isin(a))]
            prod_plan_scn4_out_toappend = prod_plan_scn4_out[~(prod_plan_scn4_out['Flavor'].isin(a))]
        
            for i in a:
                prod_plan_scn4_out1 = prod_plan_scn4_out_temp[(prod_plan_scn4_out_temp['Flavor'] == i) & (prod_plan_scn4_out_temp['Machine'].isin(portions_list))]
            
                run_list = np.unique(prod_plan_scn4_out1['Start_Time'].unique().tolist() + prod_plan_scn4_out1['End_Time'].unique().tolist())
            
                prod_plan_scn4_out2 = prod_plan_scn4_out_temp[(prod_plan_scn4_out_temp['Flavor'] == i)]
            
            #loop for times
                for j in range(len(run_list) - 1):
                    st1 = run_list[j]
                    en1 = run_list[j+1]
                
                    prod_plan_scn4_out2['running_tag'] = np.where((prod_plan_scn4_out2['Start_Time'] <= st1) & (prod_plan_scn4_out2['End_Time'] >= en1), 1, 0)
                #Total capacity
                    cap = prod_plan_scn4_out2[prod_plan_scn4_out2['running_tag'] == 1]['Capacity'].sum()
                
                    if cap > m1_m2_p_sum:
                        diff = cap - m1_m2_p_sum
                    
                        portion_pct_new = float(1 - (diff / prod_plan_scn4_out2[(prod_plan_scn4_out2['running_tag'] == 1) & (prod_plan_scn4_out2['Machine'].isin(portions_list))]['Capacity'].mean()))
                        portion_pct_new = str(round(round(portion_pct_new, 2)*100, None))+"%"
                    
                        index1 = prod_plan_scn4_out2.index[(prod_plan_scn4_out2['running_tag'] == 1) & (prod_plan_scn4_out2['Machine'].isin(portions_list))][0]
                    
                        prod_plan_scn4_out2.at[index1, 'Portion_%_cap'] = portion_pct_new
                
                    else:
                        prod_plan_scn4_out2[(prod_plan_scn4_out2['running_tag'] == 1) & (prod_plan_scn4_out2['Machine'].isin(portions_list))]['Portion_%_cap'] = '100%'
                
                #writing it in final dataframe
                #prod_plan_scn4_pout = prod_plan_scn4_out[prod_plan_scn4_out['Flavor'] != i].append(prod_plan_scn4_out2)
                prod_plan_scn4_out_toappend = prod_plan_scn4_out_toappend.append(prod_plan_scn4_out2, ignore_index = True)
        
            prod_plan_scn4_pout = prod_plan_scn4_out_toappend.copy()
    
        else:
            prod_plan_scn4_pout = prod_plan_scn4_out.copy()
            
        prod_plan_scn4_pout['Actual_prod'] = (prod_plan_scn4_pout['End_Time'].astype(float) - prod_plan_scn4_pout['Start_Time'].astype(float)) * prod_plan_scn4_pout['Capacity'].astype(float) * (prod_plan_scn4_pout['Portion_%_cap'].str[:-1].astype(float)/100)
    
        #Get updated demand and calculate ratio of updated production volume
        updated_demand = prod_plan_scn4_pout.groupby(['Flavor', 'Pack size'], as_index = False).agg({'Actual_prod': 'sum'})
    
        #Calculating gap again with updated production values
        updated_demand1 = updated_demand.merge(Demand_gap_2[['Flavor', 'Pack size', 'Demand']], on = ['Flavor', 'Pack size'], how = 'left')
        updated_demand1['gap'] = (updated_demand1['Actual_prod'] - updated_demand1['Demand'])*100/updated_demand1['Demand']
    
        #Checking for the casee where 3kg went from under production to over production. 
        #We need to reduce portion percentage for these cases
        a_under_over = updated_demand1[(updated_demand1['Pack size'] == '3kg') & (updated_demand1['gap'] > (up_limit * 100))]['Flavor'].unique()
    
        a_under_over_actual = [x for x in a if x in a_under_over]
        
        #Estimating volume to reduce for overproduction cases
        over_volume_est = updated_demand1[(updated_demand1['Flavor'].isin(a_under_over_actual)) & (updated_demand1['Pack size'] == '3kg')]
        over_volume_est['upper_limit'] = over_volume_est['Demand'] * (1 + overproduction_pu)
        over_volume_est['reduce_vol'] = over_volume_est['upper_limit'] - over_volume_est['Demand']
        over_volume_est1 = over_volume_est[['Flavor', 'reduce_vol']].drop_duplicates()
        
        if len(a) > 0:
            switches['switch'] = 1
            switches1 = switches.copy()
    
        #Getting last switch
            switches1['max_end_time'] = switches1.groupby(['Flavor', 'Pack size', 'Machine'], as_index = False)['End_Time'].transform(max)
            switches1['last_switch'] = np.where(switches1['End_Time'] == switches1['max_end_time'], 1, 0)
    
        #Cleaning column names for further join
            switches1.drop(columns = ['Machine'], inplace = True)
            switches1.rename(columns = {'new_machine': 'Machine'}, inplace = True)
        prod_plan_scn4_pout_2=prod_plan_scn4_pout.copy()
        prod_plan_scn4_pout_2['Actual_prod'] = (prod_plan_scn4_pout_2['End_Time'].astype(float) - prod_plan_scn4_pout_2['Start_Time'].astype(float)) * prod_plan_scn4_pout_2['Capacity'].astype(float) * (prod_plan_scn4_pout_2['Portion_%_cap'].str[:-1].astype(float)/100)
    
        #Get updated demand and calculate ratio of updated production volume
        updated_demand = prod_plan_scn4_pout_2.groupby(['Flavor', 'Pack size'], as_index = False).agg({'Actual_prod': 'sum'})
    
        #Calculating gap again with updated production values
        updated_demand1 = updated_demand.merge(Demand_gap_2[['Flavor', 'Pack size', 'Demand']], on = ['Flavor', 'Pack size'], how = 'left')
        updated_demand1['gap'] = (updated_demand1['Actual_prod'] - updated_demand1['Demand'])*100/updated_demand1['Demand']
        # flavor level
        flav_dem_prod = updated_demand1.groupby(['Flavor'], as_index = False).agg({'Actual_prod': 'sum','Demand':'sum'})
    
        flav_dem_prod['GAP'] = flav_dem_prod['Actual_prod']-flav_dem_prod['Demand']
        flav_dem_prod['%']= (flav_dem_prod['GAP']/flav_dem_prod['Demand'])*100
        
        return prod_plan_scn4_pout_2
    
    def func15(X,Y,prod_plan_scn4_pout_2,Demand_gap):
        wk_start_hrs=X
        threshold_3kg=10
        prod_plan_scn4_pout_1,Demand_gap_2,flav_dem_prod =F2FMapping(prod_plan_scn4_pout_2,Demand_gap,N,M)
        Demand_gap_2 = Demand_gap_2[(Demand_gap_2['gap']<= -threshold_3kg ) & (Demand_gap_2['Pack size'] == '3kg')&(Demand_gap_2['Flavor']=='f1')].reset_index(drop=True)
        a = Demand_gap_2['Flavor'].unique()
        if len(a)>0: # condition1
            prod_plan_f1= prod_plan_scn4_pout_1.copy()
        
            prod_plan_f1=prod_plan_f1[prod_plan_f1['Flavor']=='f1']
            p2_check = prod_plan_f1[prod_plan_f1['Machine']=="P2"]
            if len(p2_check.index)>0:# condition2
            
                prod_plan_f1['Pack size_1'] = prod_plan_f1['Pack size'].copy()
                dummy1 = prod_plan_f1[prod_plan_f1['Flavor'] == 'f1']
                dummy1['Pack size_1'] = dummy1['Pack size_1'].replace({'116g-f1': '116g'})
                prod_plan_f1 = prod_plan_f1[prod_plan_f1['Flavor'] != 'f1'].append(dummy1)
    
    
            #getting max end time for each machine for filtering
                machine_max = prod_plan_f1.groupby(['Flavor', 'Machine'], as_index = False).agg({'End_Time': 'max'})
                machine_max.rename(columns = {'End_Time': 'max_end_time'}, inplace = True)
    
    
            #Filtering out max end time for each machine. 1 row for each machine
                prod_plan_f1 = pd.merge(prod_plan_f1, machine_max, on = ['Flavor', 'Machine'], how = 'left')
            #prod_plan_wk2 = prod_plan_wk[prod_plan_wk['End_Time'] == prod_plan_wk['max_end_time']]
            #prod_plan_wk['max_tag'] = np.where(prod_plan_wk['End_Time'] == prod_plan_wk['max_end_time'], 1, 0)
    
    
                prod_plan_f1['flag_end_job']=np.where(prod_plan_f1['max_end_time'] == prod_plan_f1['End_Time'], 1, 0)
    
                prod_plan_f1['flag_m1_m2_same_pack']=np.where((prod_plan_f1['flag_end_job'] ==1) &( prod_plan_f1['Machine'].isin(['Machine1','Machine2'])) , 1, 0)
                prod_plan_pc=prod_plan_f1[(prod_plan_f1['flag_m1_m2_same_pack']==1 )]['Pack size_1'].unique()
            
                if len(prod_plan_pc)==1: # condition3
                    m2 = prod_plan_f1[prod_plan_f1['Machine']=="Machine2"]
                    p2 = prod_plan_f1[prod_plan_f1['Machine']=="P2"]
                
                    prod_plan_f1_without_m2= prod_plan_f1[prod_plan_f1['Machine']!='Machine2']
                    prod_plan_f1_with_m2= prod_plan_f1[(prod_plan_f1['Machine']=='Machine2')&(prod_plan_f1['flag_m1_m2_same_pack']==1)]
                    prod_plan_f1=prod_plan_f1_without_m2.append(prod_plan_f1_with_m2)
                
                    prod_plan_df = prod_plan_f1[['Flavor','Machine','Pack size','Pack size_1','Start_Time','End_Time','Portion_%_cap','Capacity']]
                
                    m2 = prod_plan_df[prod_plan_df['Machine']=="Machine2"]
                    p2 = prod_plan_df[prod_plan_df['Machine']=="P2"]
                    p2.rename(columns={'Machine':'Comparison_Machine','Pack size':'Comparison_Pack_size','Pack size_1':'Comparison_Pack size_1','Start_Time':'Comparison_Start_Time','End_Time':'Comparison_End_Time'},inplace=True)
                    m2_p2=pd.merge(m2,p2,on='Flavor',how='left')
                
                    M2_end_time = m2['End_Time'].max() #calculate last end time of M2
                
                    start_time=[] # calculate all validated P2 start and end times
                    for i in m2_p2.index:
                        if m2_p2.loc[i,'Comparison_Start_Time'] >= m2_p2.loc[i,'Start_Time'] and m2_p2.loc[i,'Comparison_End_Time'] <= m2_p2.loc[i,'End_Time']:
                            if m2_p2.loc[i,'Pack size_1'] == prod_plan_pc:
                                start_time.append([m2_p2.loc[i,'Comparison_Start_Time'],m2_p2.loc[i,'Comparison_End_Time']])
                        elif m2_p2.loc[i,'Comparison_Start_Time'] >= m2_p2.loc[i,'Start_Time']:
                            if m2_p2.loc[i,'Pack size_1'] == prod_plan_pc:
                                start_time.append([m2_p2.loc[i,'Comparison_Start_Time'],m2_p2.loc[i,'End_Time']])
                        elif m2_p2.loc[i,'Comparison_End_Time'] <= m2_p2.loc[i,'End_Time']:
                            if m2_p2.loc[i,'Pack size_1'] == prod_plan_pc:
                                start_time.append([m2_p2.loc[i,'Start_Time'],m2_p2.loc[i,'Comparison_End_Time']])
                        elif m2_p2.loc[i,'Comparison_Start_Time'] < m2_p2.loc[i,'Start_Time'] and m2_p2.loc[i,'Comparison_End_Time'] > m2_p2.loc[i,'End_Time']:
                            if m2_p2.loc[i,'Pack size_1'] == prod_plan_pc:
                                start_time.append([m2_p2.loc[i,'Start_Time'],m2_p2.loc[i,'End_Time']])
                            
                    if (len(start_time)>=1): # condition4
                    #replace P2 with P3
                        new_p2=[]
                        s=0
                        for i in start_time:
                            for j in prod_plan_df.index:
                                if prod_plan_df.loc[j,'Machine']=='P2':
                                    if prod_plan_df.loc[j,'Start_Time']==i[0] and prod_plan_df.loc[j,'End_Time']==i[1]:
                                        prod_plan_df.loc[j,'Machine']='P3'
                                    # Check if pasckszie at M1 116g--> 77%, 116-f1----> 91%
                                    #if prod_plan_df['Pack size']=='116g':
                                    prod_plan_df.loc[j,'Portion_%_cap']='91%'
                                     
                                    
                    #Cut relevant Machine2 rows
                    #prod_plan_df=prod_plan_df.assign(flag=0)
                        index = []  # to store indexes that needs to be deleted later
                        new_m2 = []   # new machine2 if needs to be added
                        s=0
                        for i in start_time:
                            for j in prod_plan_df.index:
                                if prod_plan_df.loc[j,'Machine']=='Machine2' :
                                    if prod_plan_df.loc[j,'Start_Time']==i[0] and prod_plan_df.loc[j,'End_Time']==i[1]:
                                        index.append(j)
                                    elif prod_plan_df.loc[j,'Start_Time']==i[0]:
                                        prod_plan_df.loc[j,'Start_Time']=i[1]
                                    #prod_plan_df.loc[j,'flag']=1
                                    #d={'Flavor':prod_plan_df.loc[j,'Flavor'],'Machine':'Machine2','Pack size':prod_plan_df.loc[j,'Pack size'] ,'Start_Time':i[1],'End_Time':prod_plan_df.loc[j,'End_Time','flag':0]}
                                    #j=j-1
                                    elif prod_plan_df.loc[j,'End_Time']==i[1]:
                                        prod_plan_df.loc[j,'End_Time']=i[0]
                                    elif prod_plan_df.loc[j,'Start_Time']<i[0] and prod_plan_df.loc[j,'End_Time']>i[1]:
                                        d={'Flavor':prod_plan_df.loc[j,'Flavor'],'Machine':'Machine2','Pack size':prod_plan_df.loc[j,'Pack size'],'Pack size_1':prod_plan_df.loc[j,'Pack size_1'] ,'Start_Time':i[1],'End_Time':prod_plan_df.loc[j,'End_Time'],'Flavor':prod_plan_df.loc[j,'Flavor'],'Capacity':prod_plan_df.loc[j,'Capacity'],'Portion_%_cap':prod_plan_df.loc[j,'Portion_%_cap']}
                                    #prod_plan_df.append(d, ignore_index = True)
                                        new_m2.append(d)
                                        prod_plan_df.loc[j,'End_Time']=i[0]
    
    
                            s=s+( i[1] - i[0])/2  # Extend time for M1, M2, And P3 h=job
                            s = s*4
                            s = s.round(0)/4
    
                    #drop the marked indexes
                        prod_plan_df.drop(index=index, inplace=True)
    
                    #add the required rows for machine 2    
                        for i in new_m2:
                            prod_plan_df = prod_plan_df.append(i, ignore_index = True)
                        
                        machine_max = prod_plan_f1.groupby(['Flavor', 'Machine'], as_index = False).agg({'End_Time': 'max'})
                        machine_max.rename(columns = {'End_Time': 'max_end_time'}, inplace = True)
                        machine_max['extend_time_1']=s
                        machine_max=machine_max[machine_max['Machine'].isin(['Machine1','Machine2','P3'])]
                    
                    
                    
                        merged_df=pd.merge(prod_plan_df,machine_max,on=['Flavor','Machine'],how='left')
                        merged_df['flag']=0
                    
                        b = merged_df[merged_df['Machine']=='P3']['End_Time'].max()
                        merged_df['flag'] = np.where((merged_df['Machine']=='P3') & (merged_df['End_Time']==b),1,0)
                    
                    #if float(machine_max[machine_max['Machine']=='P3']['max_end_time']) != float(machine_max[machine_max['Machine']=='Machine1']['max_end_time']):
                        p3_record = merged_df[merged_df['Machine']=='P3'].iloc[0]
                        p3_record['Start_Time'] = float(machine_max[machine_max['Machine']=='Machine1']['max_end_time'])
                        p3_record['End_Time'] = p3_record['Start_Time']
                        p3_record['Portion_%_cap'] = '91%'
                        p3_record['extend_time_1'] = s
                        p3_record['max_end_time'] = p3_record['Start_Time']
                        p3_record['Capacity'] = 1930
                        p3_record['flag']=0
                        merged_df = merged_df.append(p3_record,ignore_index = True)
                        
                    #merged_df =merged_df.assign(flag=False)
                    #if merged_df[merged_df['Machine']=='Machine1']['Pack size'].max() != merged_df[merged_df['Machine']=='Machine2']['Pack size'].max():
                        a = merged_df[merged_df['Machine']=='Machine1']['End_Time'].max()
                        merged_df['flag'] = np.where((merged_df['Machine']=='Machine1') & (merged_df['End_Time']==a),1,merged_df['flag'])
                    
                        file_2=func_file()
                        m1_record = merged_df[merged_df['Machine']=='Machine1'].iloc[0]
                        m1_record['Start_Time'] = float(machine_max[machine_max['Machine']=='Machine1']['max_end_time'])
                        m1_record['End_Time'] = m1_record['Start_Time']
                        m1_record['Portion_%_cap'] = '100%'
                        m1_record['extend_time_1'] = s
                        m1_record['max_end_time'] = m1_record['Start_Time']
                        m1_record['Pack size'] = merged_df[merged_df['Machine']=='Machine2']['Pack size']
                        m1_record['Pack size']=m1_record['Pack size'].max()
                        m1_record['Capacity']=file_2['Machine1'][m1_record['Pack size']]
                        m1_record['flag']=0
                    
                    #'''capacity = []
                    #capacity_m = file_2
    
                    #for (ps,mc) in zip(m1_record['Pack size'],m1_record['Machine']):
                      #  capacity.append(capacity_m.loc[ps][mc])
                    #m1_record['Capacity'] = capacity'''
                    
                        merged_df = merged_df.append(m1_record,ignore_index = True)
                    
                                     
                        
                        merged_df['End_Time']=np.where((merged_df['End_Time']==merged_df['max_end_time']) & (merged_df['flag']==0),merged_df['End_Time']+merged_df['extend_time_1'],merged_df['End_Time'])
                        merged_df=merged_df.drop(columns={'max_end_time','extend_time_1','Pack size_1','flag'})
                    
                    
    
                    #merged_df['Capacity'] = capacity
                        merged_df['Capacity']=np.where(merged_df['Machine']=='P3',1930,merged_df['Capacity'])
                    #merged_df['Portion_%_cap']=np.where(merged_df['Machine']=='P3','91.55%',merged_df['Portion_%_cap'])
                    #merged_df['Flavor_n']="	Base-Strawberry"
                    
                        merged_df['Actual_prod'] = (merged_df['End_Time'].astype(float) - merged_df['Start_Time'].astype(float)) * merged_df['Capacity'].astype(float) * (merged_df['Portion_%_cap'].str[:-1].astype(float)/100)
                        merged_df['Req_portion']=0
                    
                    
                    # merged_df = merged_df[merged_df['Start_Time']!=merged_df['End_Time']]
                    
                        prod_plan_scn4_pout_1=prod_plan_scn4_pout_1[prod_plan_scn4_pout_1['Flavor']!='f1']
                    #prod_plan_scn4_pout_1=prod_plan_scn4_pout_1.drop(columns={'running_tag','remove_tag'})
                        prod_plan_scn4_pout_1=prod_plan_scn4_pout_1.append(merged_df)
                        prod_plan_scn4_pout_1['Flavor']=prod_plan_scn4_pout_1['Flavor'].fillna('Base-Strawberry')
                    
                    
        else:
            prod_plan_scn4_pout_1
            
        return prod_plan_scn4_pout_1
    
    def func16(prod_plan_scn4_pout_1,N,M,Demand_gap):
        wk_start_hrs=N
        threshold_3kg=M
        Kg_full_tank,Ratio,oven_cap,m1_m2_p_sum,section_cap,threshold_multiple_machines,up_limit,low_limit ,low_limit_scn2 ,underproduction_threshold ,up_limit_scn4,overproduction_pu=func1()
        prod_plan=prod_plan_scn4_pout_1.copy()
    #stage-0
        Demand_gap_2 = Demand_gap[(Demand_gap['gap']<= -10 ) & (Demand_gap['Pack size'] == '3kg')].reset_index(drop=True)
        a = Demand_gap_2['Flavor'].unique()
        if len(a) > 0:
            prod_plan_w1 = prod_plan[prod_plan['Flavor'].isin(a)].sort_values(['Start_Time'])
        #getting max end time for each machine for filtering
            machine_max = prod_plan_w1.groupby(['Flavor', 'Machine'], as_index = False).agg({'End_Time': 'max'})
            machine_max.rename(columns = {'End_Time': 'max_end_time'}, inplace = True)
        
            machine_max1 = machine_max.groupby(['Flavor'], as_index = False).agg({'max_end_time': 'max'})
            machine_max1.rename(columns = {'max_end_time': 'max_end_time_m1'}, inplace = True)
    
        #Filtering out max end time for each machine. 1 row for each machine
            prod_plan_w1 = pd.merge(prod_plan_w1, machine_max, on = ['Flavor', 'Machine'], how = 'left')
        #prod_plan_w1['max_tag'] = np.where(prod_plan_w1['End_Time'] == prod_plan_w1['max_end_time'], 1, 0)
     
            prod_plan_w1 = pd.merge(prod_plan_w1, machine_max1, on = ['Flavor'], how = 'left')
            prod_plan_w1['max_tag'] = np.where(prod_plan_w1['End_Time'] == prod_plan_w1['max_end_time_m1'], 1, 0)
        
        
        #### Defining upper and lower limit parameters
            Demand_gap['upper_limit'] = Demand_gap['Demand']*(1 + up_limit)
            Demand_gap['lower_limit'] = Demand_gap['Demand']*(1 - low_limit)
            Demand_gap['upper_limit_scn4'] = Demand_gap['Demand']*(1 + up_limit_scn4)
    
         
        ###----- 
        #prod_plan_w1 = prod_plan_out.copy()
            flavor_list = prod_plan_w1.Flavor.unique()
    
        # for i in flavor_list:
    
            pack_size_list = prod_plan_w1[(prod_plan_w1['Flavor'].isin(flavor_list)) & (prod_plan_w1['max_tag'] == 1)][['Pack size', 'Flavor']].drop_duplicates()
            pack_size_list['val'] = 1
        #Using demand and production tables from scenario 1
        # prod_plan_w1 = prod_plan[prod_plan['Flavor'].isin(a)].sort_values(['Start_Time'])
            prod_plan_s2w1 = prod_plan_w1.copy()
    
        #getting max end time for each machine for filtering
            prod_plan_s2w1 = pd.merge(pack_size_list, prod_plan_s2w1, on = ['Flavor', 'Pack size'], how = 'right')
            prod_plan_s2w1['val'] = prod_plan_s2w1['val'].fillna(0)
    
            machine_max = prod_plan_s2w1[prod_plan_s2w1['val'] == 1].groupby(['Flavor', 'Pack size'], as_index = False).agg({'End_Time': 'max'})
            machine_max.rename(columns = {'End_Time': 'max_end_time_machine'}, inplace = True)
    
            prod_plan_s2w2 = pd.merge(prod_plan_s2w1, machine_max[['Flavor', 'Pack size', 'max_end_time_machine']], on = ['Flavor', 'Pack size'], how = 'left')
            prod_plan_s2w2['max_machine_tag'] = np.where(prod_plan_s2w2['End_Time'] == prod_plan_s2w2['max_end_time_machine'], 1, 0)
    
        #Getting ending jobs
            prod_plan_s2w2['ending_job_tag'] = np.where((prod_plan_s2w2['max_tag'] == 1) & (prod_plan_s2w2['max_machine_tag'] == 1), 1, 0)
            ending_jobs = prod_plan_s2w2[prod_plan_s2w2['ending_job_tag'] == 1]
    
            demand_gap_scn2 = Demand_gap.reset_index(drop = True)
    
        #Production
            capacity_scn2 = ending_jobs.groupby(['Flavor', 'Pack size'], as_index = False).agg({'Capacity': 'sum'})
    
        #merging both to estimate time required
            demand_gap_scn2 = pd.merge(demand_gap_scn2, capacity_scn2, on = ['Flavor', 'Pack size'], how = 'left').dropna()
    
            demand_gap_scn2['max_time_extend'] = (demand_gap_scn2['upper_limit_scn4']-demand_gap_scn2['Actual_prod'])/demand_gap_scn2['Capacity']
        # demand_gap_scn2['zero_time_reduce'] = (demand_gap_scn2['Actual_prod'] - demand_gap_scn2['Demand'])/demand_gap_scn2['Capacity']
    
            to_extend = demand_gap_scn2.groupby(['Flavor'], as_index = False).agg({'max_time_extend': 'min'})
    
        ##Reducing time from actual schedule
            prod_plan_s2w4 = pd.merge(prod_plan, to_extend, on = ['Flavor'], how = 'left')
    
            prod_plan_s2w4['max_time_extend'] = prod_plan_s2w4['max_time_extend'].fillna(0)
            prod_plan_s2w4['max_time_extend'] = prod_plan_s2w4['max_time_extend']*4
            prod_plan_s2w4['max_time_extend'] = (prod_plan_s2w4['max_time_extend'].round(0))/4
    
    
            prod_plan_s2w5 = pd.merge(prod_plan_s2w4, ending_jobs[['Flavor', 'Pack size', 'Machine', 'ending_job_tag', 'End_Time']], on = ['Flavor', 'Pack size', 'Machine', 'End_Time'], how = 'left')
    
            prod_plan_s2w5['ending_job_tag'] = prod_plan_s2w5['ending_job_tag'].fillna(0)
    
            prod_plan_out_scn2 = prod_plan_s2w5.copy()
    
            prod_plan_out_scn2['End_Time'] = np.where(prod_plan_out_scn2['ending_job_tag'] == 1, 
                                                  (prod_plan_out_scn2['End_Time'] + prod_plan_out_scn2['max_time_extend']), 
                                                  prod_plan_out_scn2['End_Time'])
    
            prod_plan_out_scn3 = prod_plan_out_scn2[['Flavor', 'Pack size', 'Machine', 'Start_Time', 'End_Time', 'Capacity', 'Actual_prod', 'Req_Portion','Portion_%_cap']]
            prod_plan_out_scn3['Actual_prod'] = (prod_plan_out_scn3['End_Time'].astype(float) - prod_plan_out_scn3['Start_Time'].astype(float)) * prod_plan_out_scn3['Capacity'].astype(float) * (prod_plan_out_scn3['Portion_%_cap'].str[:-1].astype(float)/100)
     
        else:
            prod_plan_out_scn3 = prod_plan.copy()# To avoid overwriting of original Demand gap
    
        prod_plan_out=prod_plan_out_scn3.copy()
        
        return prod_plan_out
    
    
    # #### F2F Mapping -  Scenario-4
    
    # #### Scenario 4 ends here
    def SKUdetails():
        path=path_X()
        inp_file = "\\Oreo_data"
        SKU= pd.read_excel(path+ inp_file+".xlsx",index_col=0, header = 0, sheet_name= "SKUdetails",usecols="A:D")
        return SKU
    # #### Output in Excel -- after 3KG Scenaros
    
    def output_func(demand_file3,N_,M_,string,file_3_2):
        N=N_
        M=M_
        list_1=[0,2,4,6,8,10,12,14,16]
        #string=str(input("Enter Week Number:"))
        #N=float(input("Enter weekly Start hour:"))
        #M=float(input("Enter threshold demand, threshold_3kg:"))
        df_new_m=pd.DataFrame(columns = ['Flavor_Packsize_MC',
                                'Flavor', 'Pack size',
                                  'Machine','Start_time',
                                  'Finish_time','Processing Time',
                                   'Capacity','Actual_prod','Demand'])
        file_3_3=file_3_2
        file_3=demand_file3
        for i in list_1:
            file_1,file_2,file_4=func3(i)
            file_3=demand_file3
            liste=func7(file_1,file_2,file_3,file_4)
            X=func8(liste,file_3,file_2)
            df_new_m=df_new_m.append(X)
        ####updating start and end time after model output######u
        df=func9(df_new_m,flav_seq)
        data_prep=func10(df)
        
        final_data,Demand_gap=func11(data_prep,file_3_3,N)
        
        M=final_data.copy()
        
        KPI_1,KPI_2,KPI_3=KPI(M)
        
        prod_plan_out_scn3,data_prep,updated_demand1=func12(final_data,Demand_gap,N,M)
        
        prod_plan_scn4_pout_2=func13(data_prep,updated_demand1,N,M)
        
        prod_plan_scn4_pout_1=func15(N,M,prod_plan_scn4_pout_2,Demand_gap)
        
        prod_plan_scn4_pout_1,Demand_gap_2,flav_dem_prod=F2FMapping(prod_plan_scn4_pout_1,Demand_gap,N,M)
        
        prod_plan_out_scn5=func16(prod_plan_scn4_pout_1,N,M,Demand_gap_2)
        
        prod_plan_out_scn5_1,Demand_gap_2,flav_dem_prod=F2FMapping(prod_plan_out_scn5,Demand_gap,N,M)
        
        final_data=prod_plan_out_scn5.copy()
        
        image,liste_m,Jobs,N_Machines,overall_change,Flavor_change_time,Total_M_S_time=Gantt_chart(prod_plan_out_scn5,file_3,KPI_1,KPI_2,KPI_3,N,string)
        
        final_df=final_data.copy()
        
        final_df.drop(['Capacity', 'Actual_prod','Req_Portion','Portion_%_cap'], axis = 1,inplace=True)
        final_df['Duration']=final_df['End_Time']-final_df['Start_Time']
        final_df['SKU']=final_df['Flavor']+final_df['Pack size']
        SKU_details_x=SKUdetails()
        final_df=pd.merge(final_df,SKU_details_x,on=['SKU'],how='left')
        final_df.drop(['SKU'],axis=1,inplace=True)
        x=flav_dem_prod['Actual_prod'].sum()
        y=flav_dem_prod['Demand'].sum()
        Gap=x-y
        Gap_p=(Gap/y)*100
        Gap_per=round(Gap_p,3)
        
        Demand_gap_2.rename(columns={'gap':'GAP %'},inplace=True)
        
        return Gap_per,flav_dem_prod,Demand_gap_2,image,KPI_1,KPI_2,KPI_3,final_df,Jobs,N_Machines,overall_change,Flavor_change_time,Total_M_S_time
    Gap_per,updated_Fla,Demand_gap_2,image,KPI_1,KPI_2,KPI_3,final_df,Jobs,N_Machines,overall_change,Flavor_change_time,Total_M_S_time=output_func(demand_file3,N,M,string,file_3_2)
    return Gap_per,updated_Fla,Demand_gap_2,image,KPI_1,KPI_2,KPI_3,final_df,Jobs,N_Machines,overall_change,Flavor_change_time,Total_M_S_time

#Streamlit page Display--------------------------------------------------------
@st.cache(allow_output_mutation=True,suppress_st_warning=True)
def user_file3(df):
# SKU - mapping from SKU details/Masters
    Kg_full_tank= 1036.27
    Ratio = 0.71
    path=os.path.dirname(__file__) #In-out
    #path_2=("C:\\Users\\gururaj.kunagi\\Downloads\\FMCG_Biscuit") # outout
    inp_file = "\\Oreo_data"

    # consider directly from Input demand file 
    #file_1 = pd.read_excel(path + inp_file+".xlsx",index_col=0, header = 0, sheet_name= "Active Jobs",skiprows=12,nrows=1,usecols="A:H")
    #file_2 = pd.read_excel(path + inp_file+".xlsx",index_col=0, header = 0, sheet_name= "Capacity",nrows=7,usecols="A:D") # speed of Machine
    sku_list = pd.read_excel(path+ inp_file+".xlsx",sheet_name="SKUdetails") # SKU details - Master

    # demand Input ( SKU and its Demand )
    #demand_df= pd.read_excel(path+demand_in+ ".xlsx")
    demand_df = df

    # #Demand File, # delete this after Demand from demand_input works
    # file_3 = pd.read_excel(path + inp_file + ".xlsx",index_col=0, header = 0, sheet_name= week,skiprows=3,nrows=9,usecols="B:J")
    # file_3['3kg']= int('')
    # dem_file = pd.read_excel(path + inp_file + ".xlsx",index_col=0, header = 0, sheet_name= week,skiprows=3,nrows=9,usecols="B:J")

    # Change over file
    file_4 = pd.read_excel(path + inp_file + ".xlsx",index_col=0, header = 0, sheet_name= "Change over")
    # Change over matrix in required form
    From = []
    To = []
    ChangeOver = []
    f2f = []
    for index in file_4.index:
        for col in file_4.columns:
            f2f.append(str(col)+str(index))
            To.append(index)
            From.append(col)
            ChangeOver.append(file_4[index][col])

    file_co = pd.DataFrame({'f2f':f2f,'From':From,'To':To,'ChangeOver':ChangeOver})
    #Flavor Table 
    Flavor = ['Base-Strawberry','Double-B&R','Double-G&P','Single-BC','Single-Green Tea','Single-Rose','Single-Vanilla','Single-Peach Olong','Single-Yoghurt']
    Flavor_F = ['f1','f2','f3','f4','f5','f6','f7','f8','f9']
    flav_df = pd.DataFrame(list(zip(Flavor_F,Flavor)), columns = ['Flavor_F','Flavour'],index=None)
    #flav_df_1 = pd.DataFrame(list(zip(Flavor_F,Flavor)), columns = ['Flavor_F','Flavor_n'],index=None)

    sku_list = pd.merge(sku_list,flav_df, on = ['Flavour'], how = "left")

    def extract_num(pack_size):
        if pack_size.lower() == "bulk":
            return '3kg'
        elif pack_size=="Slug-116g-f1":
            return '116g-f1'
        else:
            x = re.findall('(\d+)', pack_size) 
            y = x[0] + 'g'

            return y

    sku_list['Pack_Size_num'] = sku_list['Pack Size'].apply(lambda x :extract_num(x))

    sku_df = sku_list[['Product Number','Product Short Description','Flavour','Flavor_F','Pack Size','Pack_Size_num','Cases to KG']]


    sku_df = sku_df.sort_values(by = ['Product Number'],ascending=False).reset_index(drop=True)
    sku_df['duplicate']= sku_df.duplicated(subset=['Flavour', 'Flavor_F', 'Pack Size', 'Pack_Size_num'])

    packsize = []
    for i in range(len(sku_df)):
        if sku_df['duplicate'][i] == True:
            packsize.append(sku_df['Pack_Size_num'][i]+'-'+sku_df['Flavor_F'][i])
        else:
            packsize.append(sku_df['Pack_Size_num'][i])

    sku_df['packsize'] = packsize
    #sku_df.drop(labels = ['Pack Size','Pack_Size_num','duplicate'], inplace = True, axis =1)

    sku_df = sku_df.rename(columns = {"Flavor_F":'Flavor','packsize':'Pack size'})
    ### Demand Conversion - using Tank size
    sku_df_demand = pd.merge(sku_df,demand_df,on='Product Number',how='inner')
    sku_df_demand =sku_df_demand.rename(columns={'Demand in Cases':'Demand'})
    sku_df_demand =sku_df_demand.rename(columns={'Cases to KG':'KG_Converter'})

    sku_df_demand['Demand in KG']=(sku_df_demand.Demand)* (sku_df_demand.KG_Converter)

    sku_df_demand['sum_Demand'] = sku_df_demand.groupby('Flavor')['Demand in KG'].transform('sum')
    sku_df_demand['%contribution']= (sku_df_demand['Demand in KG'] / sku_df_demand['sum_Demand'])

    new_df=pd.DataFrame(data=sku_df_demand.groupby('Flavor')['Demand in KG'].sum())
    new_df['Demand_0']=new_df['Demand in KG']

    new_df['Demand_ratio'] = new_df['Demand_0']* Ratio

    new_df['#Tanks']= new_df['Demand_ratio']/ Kg_full_tank
    new_df['tanks_round'] = round(new_df['#Tanks'])

    new_df['Demand_1']= (new_df['tanks_round']*Kg_full_tank)/ Ratio
    new_df['Tanks_dec']= new_df['tanks_round'] - 0.1
    new_df['Tanks_inc']=new_df['tanks_round']+0.1

    new_df['Demand_2_dec']=(new_df['Tanks_dec']*Kg_full_tank)/ Ratio
    new_df['Demand_2_inc']=(new_df['Tanks_inc']*Kg_full_tank)/ Ratio

    new_df['Demand_3']= np.where(abs(new_df['Demand_2_dec']-new_df['Demand_0'])>abs(new_df['Demand_2_inc']-new_df['Demand_0']),new_df['Demand_2_inc'], new_df['Demand_2_dec'])

    sku_df_demand=pd.merge(left=sku_df_demand,right=new_df[['Demand_3']],how='left',on='Flavor')

    sku_df_demand['Demand_contri']= sku_df_demand['%contribution']*sku_df_demand['Demand_3']

    sku_output = pd.pivot_table(data=sku_df_demand,index=['Flavor'], columns=['Pack size'], values='Demand_contri',aggfunc='sum',fill_value=0)
    # sku_output.fillna('',inplace=True)

    # Consolidating all 3kg into one # make it dynamic for all flavor 
    y=sku_output.loc[:,sku_output.columns.str.startswith('3kg-')].columns
    for i in y:
        sku_output['3kg']= sku_output['3kg']+ sku_output[i]

    ## Demand 
    dem_file=sku_output.copy() 

    file_3=sku_output.copy()
    file_3['3kg']= int('0') # for model
    file_3.drop(columns = ['3kg-f1'], inplace = True)
    file_3.drop(columns = ['3kg-f5'], inplace = True)
    file_3.drop(columns = ['466g-f1'], inplace = True)
    
    
    return file_3
@st.cache(allow_output_mutation=True,suppress_st_warning=True)
def flav_seq(file_3):
    path=os.path.dirname(__file__)
    ("C:\\Users\\gururaj.kunagi\\Downloads\\Streamlit_FMCG\\")
    inp_file = "\\Oreo_data"
    file_1=pd.read_excel(path+inp_file+".xlsx",index_col=0, header = 0, sheet_name= "Active_jobs_2")
    file_2 = pd.read_excel(path + inp_file+".xlsx",index_col=0, header = 0, sheet_name= "Capacity",nrows=7,usecols="A:D")
    #file_3=pd.read_excel(path + inp_file+".xlsx",index_col=0, header = 0, sheet_name= "Dmd wk"+N+"-2",skiprows=15,nrows=9,usecols="B:J")
    file_4 = pd.read_excel(path + inp_file + ".xlsx",index_col=0, header = 0, sheet_name= "Change over")
    file_3['97']=file_3['97g']+file_3['116g']+file_3['116g-f1']+file_3['194g']+file_3['233g']+file_3['388g']+file_3['466g']+file_3['3kg']
    file_3.drop(['97g','116g','116g-f1','194g','233g','388g','466g','3kg'],axis=1,inplace=True)
    file_3.rename(columns = {'97':'97g'}, inplace = True)

    #dem_file = pd.read_excel(path + inp_file+".xlsx",index_col=0, header = 0, sheet_name= "Dmd wk"+N+"-2",skiprows=15,nrows=9,usecols="B:J")
    # Change over file
    B = [ (i,j) for i in list(file_1.index) for j in list(file_1.columns[0:1]) if  file_3.loc[i][j] > 0]

    A = [(i,j) for i in B for j in list(file_2.columns[0:1]) ]#if  file_2.loc[i[1]][j] > 0]

    C = [(B[i],B[j]) for i in range(len(B)) for j in range(len(B)) if j > i]

    H = {(B[i],B[j]): file_4.loc[B[i][0]][B[j][0]] if B[i][1] == B[j][1] else file_4.loc[B[i][0]][B[j][0]] +1 
         for i in range(len(B)) for j in range(len(B)) if j != i}


    mdl1 = gb.Model("parallell_Machine_2")
    assign =mdl1.addVars(A,vtype = gb.GRB.BINARY,name = "assign")#i işi m makinesine atanısrsa 1
    after =mdl1.addVars(C,vtype = gb.GRB.BINARY,name = "after")#j iden önceyse 1
    finish = mdl1.addVars(B, name = "finish")
    start_ = mdl1.addVars(B,name = "start_")
    #tardy_ = mdl1.addVars(range(1,job_number+1), name = "tardy_")
    makespan_ = mdl1.addVar(name = "makespan_")

    mdl1.setObjectiveN(gb.quicksum(finish[j] for j in B),0,0,1)
    mdl1.addConstrs(finish[j]  >= start_[j] for m in list(file_2.columns)
                    for j in B if file_2.loc[j[1]][m] != 0 and (j,m) in A)
    mdl1.addConstrs(gb.quicksum(assign[j,m] for m in list(file_2.columns) if (j,m) in A)
                    == 1 for j in B )
    M = 700
    #shshhshsh
    mdl1.addConstrs(start_[i] >= finish[j] - M*(1-after[i,j]) + H[j,i]
            for m in list(file_2.columns)[3:] for i in B for j in B if B.index(j) > B.index(i) and (j,m) in A and (i,m) in A)
    #gagagag
    mdl1.addConstrs(start_[j] >= finish[i] + H[i,j] 
    for m in list(file_2.columns)[3:] for i in B for j in B 
    if B.index(j) > B.index(i) and (j,m) in A and (i,m) in A)

    mdl1.addConstrs((start_[i] >= finish[j] - M*(1-after[i,j])+ H[j,i]
            for m in list(file_2.columns)[:3] for i in B for j in B if B.index(j) > B.index(i) and (j,m) in A and (i,m) in A
                   and i[0] != j[0]),name = "kısıt")
    mdl1.addConstrs(start_[j] >= finish[i] - M*(after[i,j])+ H[i,j] 
    for m in list(file_2.columns)[:3] for i in B for j in B 
    if B.index(j) > B.index(i) and (j,m) in A and (i,m) in A and i[0] != j[0])
    mdl1.addConstrs(start_[i] >= finish[j] - M*(1-after[i,j])-M*(1-assign[i,m])-M*(1-assign[j,m]) + H[j,i]
            for m in list(file_2.columns)[:3] for i in B for j in B if B.index(j) > B.index(i) and (j,m) in A and (i,m) in A)

    mdl1.addConstrs(start_[j] >= finish[i] - M*(after[i,j])-M*(1-assign[i,m])-M*(1-assign[j,m])+ H[i,j] 
    for m in list(file_2.columns)[:3] for i in B for j in B 
    if B.index(j) > B.index(i) and (j,m) in A and (i,m) in A)
    mdl1.addConstrs(start_[i] >= 1 for i in B)#mdl1.Params.MIPFocus = 2
    mdl1.Params.TimeLimit = 20
    mdl1.optimize()
    liste = []
    for i in assign:
        if assign[i].x >= 0.99:
            liste.append((i,round(start_[i[0]].x),round(finish[i[0]].x)))
    print(liste)
    df = pd.DataFrame(liste, columns=['Flavor_Packsize_MC', 'Start_time','Finish_time'])
    df.sort_values(by=['Start_time'], inplace=True)
    df = pd.DataFrame(liste, columns=['Flavor_Packsize_MC', 'Start_time','Finish_time'])
    df.sort_values(by=['Start_time'], inplace=True)
    df= df.reset_index()
    df.drop(['index','Start_time','Finish_time'],axis=1,inplace=True)
    Machine = []
    Flavor = []
    Pack_size = []
    for i in range(0,len(df['Flavor_Packsize_MC'])):
        Machine.append(df['Flavor_Packsize_MC'][i][1])
        Flavor.append(df['Flavor_Packsize_MC'][i][0][0])
        Pack_size.append(df['Flavor_Packsize_MC'][i][0][1])
    df['Machine'] = Machine
    df['Flavor'] = Flavor
    df['Pack size'] = Pack_size
    df.drop(['Flavor_Packsize_MC','Machine','Pack size'],axis=1,inplace=True)
    Flav_seq=df['Flavor'].tolist()
    
    return Flav_seq


####################################  Stream Lite   #################################################
#Loading 
path=os.path.dirname(__file__)
inp_file = "\\Oreo_data"
df1= pd.read_excel(path+inp_file+".xlsx",index_col=0, header = 0, sheet_name= "Active_jobs_2")
df1=df1.dropna()
df2= pd.read_excel(path+inp_file +".xlsx",index_col=0, header = 0, sheet_name= "Change over")
df2=df2.dropna()
df3 = pd.read_excel(path+inp_file+".xlsx",index_col=0, header = 0, sheet_name= "Capacity",nrows=8)
df3=df3.dropna()
P_I="\\logo"
img=load_image(path+P_I+'.PNG')
st.sidebar.image(img)

st.markdown("""
<style>
sidebar.sidebar-content {
    background-color: #111 !important;
}
</style>
    """, unsafe_allow_html=True)
st.header("Production Planning and Detailed scheduling")
status = st.selectbox("", ('Optimized Solution','Input File','User uploaded file optimized solution'))
col9,col10,col11=st.columns(3)
with col9:
    st.write(" ")
with col10:
    st.write(" ")
with col11:
    with st.expander("Click on '+' to get available Flavor names"):
         st.write("""
                   Here below have mentioned the flavor name and flavor number.\n
         
                     f1-Base-Strawberry\n
                     f2-Double-B&R\n
                     f3-Double-G&P\n
                     f4-Single-BC\n
                     f5-Single-Green Tea\n
                     f6-Single-Rose\n
                     f7-Single-Vanilla\n
                     f8-Single-Peach Olong\n
                     f9-Single-Yoghurt
                     """)
    


if status == 'Input File':
    html_temp ="""
    <div>
    <h3 style="color:BLUE;text-align:left;">Input Files </h3>
    </div>"""
    #x=st.sidebar.selectbox('Choose a week to display demand', ['14','16','17','18','48','49','50','51','52'])
    st.markdown(html_temp, unsafe_allow_html=True)
    st.write("")

    st.subheader('Capacity of Machines in Kg/Hour')
    st.dataframe(df3.style.format({'Machine1':'{:.1f}','Machine2':'{:.1f}','Machine3':'{:.1f}','Portion1':'{:.1f}','Portion2':'{:.1f}','Portion3':'{:.1f}'}))
    st.subheader('Change Over time in hours')
    #x=round()
    df2.insert(loc=0, column="flavor", value=['Flavor 1','Flavor 2','Flavor 3','Flavor 4','Flavor 5','Flavor 6','Flavor 7','Flavor 8','Flavor 9'])
    st.dataframe(df2.style.format({'f1': '{:.1f}', 'f2':'{:.1f}','f3':'{:.1f}','f4': '{:.1f}', 'f5': '{:.1f}', 'f6': '{:.1f}','f7': '{:.1f}', 'f8': '{:.1f}','f9': '{:.1f}'}))
    
    uploaded_files = st.sidebar.file_uploader(label="Choose a CSV or Excel file",type=['csv','xlsx'])
    global df
    if uploaded_files is not None:
        print("Hello")
        try:
            df=pd.read_csv(uploaded_files)
        except Exception as e:
            df=pd.read_excel(uploaded_files)
        try:
            st.subheader("Uploaded File")
            df.drop(['Unnamed: 0'],axis=1,inplace=True)
            st.write(df)
        except Exception as e:
            st.write(" ")
    # uploaded_files = st.sidebar.file_uploader("Choose a CSV file", accept_multiple_files=True)
    # for uploaded_file in uploaded_files:
    #      bytes_data = uploaded_file.read()
    #      st.write("filename:", uploaded_file.name)
    #      st.write(bytes_data)    
    st.sidebar.button('Submit')
        


if status == 'Optimized Solution':
    
    html_temp = """
    <div>
    </div>
    """
    inp_file="\\Oreo_data"
    st.markdown(html_temp, unsafe_allow_html=True)
    st.write("")
    flag=1
    x=st.sidebar.selectbox('Choose a Week Number', ['14','16','17','18','48','49','50','51','52'])
    file_3_1=pd.read_excel(path + inp_file+".xlsx",index_col=0, header = 0, sheet_name= "Dmd wk"+x+"-2",skiprows=15,nrows=9,usecols="B:J")
    file_3=file_3_1.copy()
    file_3['3kg']= 0
    Flav_seq=flav_seq(file_3)

    df = pd.DataFrame(Flav_seq,columns=['Sequence'])
    df['Lag_flavor'] = df['Sequence'].shift(1)
    file_4 = pd.read_excel(path + inp_file + ".xlsx",index_col=0, header = 0, sheet_name= "Change over")
    # Change over matrix in required form
    From = []
    To = []
    ChangeOver = []
    f2f = []
    for i in Flav_seq:
        for j in Flav_seq:
            f2f.append(str(j)+str(i))
            To.append(i)
            From.append(j)
            ChangeOver.append(file_4[i][j])
            
       
    
    file_co = pd.DataFrame({'f2f':f2f,'From':From,'To':To,'ChangeOver':ChangeOver})
    df['f2f']=df['Lag_flavor']+df['Sequence']
    
    df=pd.merge(df,file_co,how='left',on=['f2f'])
    Time=str(df['ChangeOver'].sum())
        
    # if st.sidebar.button('Submit'):
    df4= pd.read_excel(path + inp_file+".xlsx",index_col=0, header = 0, sheet_name= "Dmd wk"+x+"-2",skiprows=15,nrows=9,usecols="B:J")
    st.subheader(" Demand(Kg)-"+"Week "+x)
    df4.insert(loc=0, column="flavor", value=['Flavor 1','Flavor 2','Flavor 3','Flavor 4','Flavor 5','Flavor 6','Flavor 7','Flavor 8','Flavor 9'])
    #df4= pd.DataFrame(['row1', 'row2'], index=pd.Index([1, 2], name='my_index'))
    st.dataframe(df4.style.format({'97g': '{:.0f}', '116g': '{:.0f}', '116g-f1': '{:.0f}','194g': '{:.0f}', '233g': '{:.0f}', '388g': '{:.0f}','466g': '{:.0f}', '3kg': '{:.0f}'}))
    
    
    m=" "
    c=Flav_seq
    for i in range(len(c)):
        if i<len(c)-1:
            m=m+c[i]+" ⟶ "
        else:
            m=m+c[i]
    title=st.text_input(" Optimized Model-Flavour Sequence\n",m+"     "+"(Flavor to Flavor Change Over Time:"+Time+" Hrs) ") 
    options = st.sidebar.multiselect(
     'What are your required flavors and sequence',
     ['f1', 'f2', 'f3', 'f4','f5','f6','f7','f8','f9'],
     Flav_seq)
    y=st.sidebar.number_input('Week Start Hour',0)
    z=st.sidebar.selectbox('Demand vs Actual prod gap-3KG ( %)',[0,5,10,15])


    
    if st.sidebar.button('Run'):
        #flag=1
        n=" "
        Gap_per,updated_Fla,Demand_gap_2,image,KPI_1,KPI_2,KPI_3,final_df,Jobs,N_Machines,overall_change,Flavor_change_time,Total_M_S_time=func(file_3,y,z,options,x,file_3_1)
        
        
        for i in range(len(options)):
            if i<len(options)-1:
                n=n+options[i]+"⟶"
            else:
                n=n+options[i]
        
        title=st.text_input("User selected Flavor Sequence\n",n+"     "+"(Flavor to Flavor Change Over Time:"+Flavor_change_time+" Hrs)") 

        csv = convert_df(final_df)
       
        st.subheader("KPIs related to production planning")
        col4, col5, col3 = st.columns(3)
        col4.metric("Flavor Change time ",Flavor_change_time+"Hrs")
        col5.metric("Total make span time",Total_M_S_time+"Hrs")
        col3.metric("Demand vs Actual production gap (%)",Gap_per)
        st.write("             ------------------              ")
        col1,col2,col20=st.columns(3)
        col20.metric("# of Setup Changes Overall",overall_change)
        col1.metric("# of Jobs",Jobs )
        col2.metric("# of machines",N_Machines)
        st.write("__________________________________________________________________\n\n")
        
        st.subheader("Gantt Chart-Production Plan and Detailed Schedule")
        with open(path+x+".png", "rb") as file:
              btn = st.download_button(
              label="Download Gantt Chart",
              data=file,
              file_name="production_plan_week_"+x+".png",
              mime="image/png"
                   )

        st.pyplot(image)
        st.subheader("Production planning in Tabular form")
        st.download_button(
        "Download Production plan.CSV",
        csv,
        "Production_plan_"+x+".csv",
        "text/csv",
        key='download-csv')
        st.dataframe(final_df.style.format({'Start_Time': '{:.2f}', 'End_Time': '{:.2f}', 'Duration':'{:.2f}'}) )
        
        st.set_option('deprecation.showPyplotGlobalUse', False)
        # co21, col22=st.columns(2)
        # with col22:
        #     if st.button('KPI-2'):
                
        st.subheader("KPI-1: Demand vs Actual production gap at Flavor level")
        st.write(updated_Fla.style.format({'Actual_prod': '{:.2f}','Demand':'{:.2f}','GAP':'{:.2f}','GAP %':'{:.2f}'}))
        
        st.subheader('KPI-2: Demand vs Actual production gap at SKU ( Flavor and Pack-size ) level ')
        st.write(Demand_gap_2.style.format({'Actual_prod': '{:.2f}','Demand':'{:.2f}','GAP_value':'{:.2f}','GAP %':'{:.2f}'}))
        
        st.subheader("KPI-3:Flavor change over time")
        st.dataframe(KPI_3.style.format({'Flavor_change_over_time ':'{:.2f}'}))
        
        st.subheader("KPI-4:Flavor change")
        st.write(KPI_1)
        
        st.subheader("KPI-5:Number of setup change")
        st.write(KPI_2)
        
if  status == 'User uploaded file optimized solution':
    # y=st.sidebar.number_input('Week Start Hour',0)
    # z=st.sidebar.selectbox('Demand vs Actual prod gap-3KG ( %)',[0,5,10,15])
    uploaded_files= st.sidebar.file_uploader(label="Choose a Excel input file Which has \"Product Number\" and \"Demand in Cases\" columns",type=['xlsx'])
    global df_m
    x="Uploaded file"
    #st.write("Please upload your demand file to visualize")
    if uploaded_files is not None:
        #try:
            df_m=pd.read_excel(uploaded_files)
            st.subheader("Uploaded File")
            st.write(df_m.style.format({'Demand in Cases': '{:.0f}'}))
            file_3=user_file3(df_m)
            st.write("Demand (Kg) Required for given SKU cases")
            st.write(file_3.style.format({'97g': '{:.0f}', '116g': '{:.0f}', '116g-f1': '{:.0f}','194g': '{:.0f}', '233g': '{:.0f}', '388g': '{:.0f}','466g': '{:.0f}', '3kg': '{:.0f}'}))
            Flav_seq=Flav_seq_pulp(file_3)        
            data = pd.DataFrame(Flav_seq,columns=['Sequence'])
            data['Lag_flavor'] = data['Sequence'].shift(1)
            inp_file = "\\Oreo_data"
            file_4 = pd.read_excel(path + inp_file + ".xlsx",index_col=0, header = 0, sheet_name= "Change over")
            # Change over matrix in required form
            From = []
            To = []
            ChangeOver = []
            f2f = []
            for i in Flav_seq:
                for j in Flav_seq:
                    f2f.append(str(j)+str(i))
                    To.append(i)
                    From.append(j)
                    ChangeOver.append(file_4[i][j])
                    
               
            
            file_co = pd.DataFrame({'f2f':f2f,'From':From,'To':To,'ChangeOver':ChangeOver})
            data['f2f']=data['Lag_flavor']+data['Sequence']
            
            data=pd.merge(data,file_co,how='left',on=['f2f'])
            Time=str(data['ChangeOver'].sum())
                
            
            m=" "
            c=Flav_seq
            for i in range(len(c)):
                if i<len(c)-1:
                    m=m+c[i]+" ⟶ "
                else:
                    m=m+c[i]
            title=st.text_input(" Optimized Model-Flavour Sequence\n",m+"     "+"(Flavor to Flavor Change Over Time:"+Time+" Hrs) ") 
            # options = st.sidebar.multiselect(
            #  'What are your required flavors and sequence',
            #  ['f1', 'f2', 'f3', 'f4','f5','f6','f7','f8','f9'],
            #  Flav_seq)
            # y=st.sidebar.number_input('Week Start Hour',0)
            # z=st.sidebar.selectbox('Demand vs Actual prod gap-3KG ( %)',[0,5,10,15])
            # x="Uploaded file"
            # if st.sidebar.button('Run'):
            #     n=" "
            #     Gap_per,updated_Fla,Demand_gap,image,KPI_1,KPI_2,KPI_3,final_df,Jobs,N_Machines,overall_change,Flavor_change_time,Total_M_S_time=func(file_3,y,z,options,x)
            #     p=options
            #     for i in range(len(p)):
            #         if i<len(p)-1:
            #             n=n+p[i]+"⟶"
            #         else:
            #             n=n+p[i]
            #     title=st.text_input("User selected Flavor Sequence\n",n+"     "+"(Flavor to Flavor Change Over Time:"+Flavor_change_time+" Hrs)") 
        
            #     csv = convert_df(final_df)
               
            #     st.subheader("KPIs related to production planning")
            #     col4, col5, col3 = st.columns(3)
            #     col4.metric("Flavor Change time ",Flavor_change_time+"Hrs")
            #     col5.metric("Total make span time",Total_M_S_time+"Hrs")
            #     col3.metric("# of Setup Changes Overall",overall_change )
            #     st.write("             ------------------              ")
            #     col1,col2=st.columns(2)
            #     col1.metric("# of Jobs",Jobs )
            #     col2.metric("# of machines",N_Machines)
            #     st.write("__________________________________________________________________\n\n")
                
            #     st.subheader("Gantt Chart-Production Plan and Detailed Schedule")
            #     with open(path+x+".png", "rb") as file:
            #           btn = st.download_button(
            #           label="Download Gantt Chart",
            #           data=file,
            #           file_name="production_plan_week_"+x+".png",
            #           mime="image/png"
            #                )
        
            #     st.pyplot(image)
            #     st.subheader("Production planning in Tabular form")
            #     st.download_button(
            #     "Download Production plan.CSV",
            #     csv,
            #     "Production_plan_"+x+".csv",
            #     "text/csv",
            #     key='download-csv')
            #     st.dataframe(final_df.style.format({'Start_Time': '{:.2f}', 'End_Time': '{:.2f}', 'Duration':'{:.2f}'}) )
                
         
            #     st.set_option('deprecation.showPyplotGlobalUse', False)
            
            #     st.subheader("KPI-1:Flavor change over time")
            #     st.dataframe(KPI_3.style.format({'Flavor_change_over_time ':'{:.2f}'}))
            #     st.subheader("KPI 2:Flavor change")
            #     st.write(KPI_1)
            #     st.subheader("KPI-3:Number of setup change")
            #     st.write(KPI_2)
        #except Exception as e:
           # st.write(" ")
    else:
        st.write("Please upload your demand file to get the production and  visualization in chart")
        
    