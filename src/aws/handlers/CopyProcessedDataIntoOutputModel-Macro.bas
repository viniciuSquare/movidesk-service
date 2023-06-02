Sub CopyData(product As String, service As String)
    ' Set the base path for the model files
    Dim modelBasePath As String
    modelBasePath = "/Users/square/Documents/Quiver/AWS_PerformanceReport/src/treated/Model/"
    
    Dim modelWorkbookPath As String
    Dim cpuWorkbookPath As String
    Dim memoryWorkbookPath As String
    
    ' Construct the complete file paths using the base path and provided parameters
    modelWorkbookPath = modelBasePath & product & " " & service & "/Model - " & product & " - " & service & ".xlsx"
    cpuWorkbookPath = modelBasePath & product & " " & service & "/" & product & " - " & service & " - CPU.xlsx"
    memoryWorkbookPath = modelBasePath & product & " " & service & "/" & product & " - " & service & " - Memory.xlsx"
    
    ' Rest of the code remains the same...
    Dim modelWorkbook As Workbook
    Dim modelSheet As Worksheet
   
    Dim cpuWorkbook As Workbook
    Dim cpuSheet As Worksheet
    
    Dim memoryWorkbook As Workbook
    Dim memorysheet As Worksheet
    
    'Set the file paths and open the workbooks
    Set modelWorkbook = Workbooks.Open(modelWorkbookPath)
    Set cpuWorkbook = Workbooks.Open(cpuWorkbookPath)
    Set memoryWorkbook = Workbooks.Open(memoryWorkbookPath)
    
     'Set ranges to data source and output
    Dim sourceRange As String
    
    Dim cpuOutputRange As String
    Dim memoryOutputRange As String
    
    If product = "PRO" And service = "Application" Then
        sourceRange = "A2:N13"
        
        cpuOutputRange = "B4:O15"
        memoryOutputRange = "B26:O37"
    End If
    
    If product = "PRO" And service = "Database" Then
        sourceRange = "A2:E13"
        
        cpuOutputRange = "B4:F15"
        memoryOutputRange = "H4:L15"
    End If
    
     If product = "PLUS" And service = "Application" Then
        sourceRange = "A2:E13"
        
        cpuOutputRange = "B4:F15"
        memoryOutputRange = "H4:L15"
    End If
    
    If product = "PLUS" And service = "Database" Then
        sourceRange = "A2:G13"
        
        cpuOutputRange = "B4:H15"
        memoryOutputRange = "B26:H37"
    End If

    'Loop through each sheet on data workbook
    For Each cpuSheet In cpuWorkbook.Sheets
    
        'Get data from memory sheet
        Set memorysheet = memoryWorkbook.Sheets(cpuSheet.Name)
        
        'Duplicate the DayModel sheet in the Model workbook
        modelWorkbook.Sheets("DayModel").Copy After:=modelWorkbook.Sheets(modelWorkbook.Sheets.Count)
    
        'Rename the cloned sheet with the CPU sheet name
        modelWorkbook.Sheets(modelWorkbook.Sheets.Count).Name = cpuSheet.Name
    
        'Copy the data from the CPU and Memory sheets to the cloned sheet in the Model workbook
        modelWorkbook.Sheets(cpuSheet.Name).Range(memoryOutputRange).Value = memorysheet.Range(sourceRange).Value
        modelWorkbook.Sheets(cpuSheet.Name).Range(cpuOutputRange).Value = cpuSheet.Range(sourceRange).Value

    Next cpuSheet
    'Update current month reference on Mês report
    modelWorkbook.Sheets("Mês").Range("B2").Value = modelWorkbook.Sheets(modelWorkbook.Sheets.Count).Range("B4").Value

    'Close the workbooks
    memoryWorkbook.Close SaveChanges:=False
    cpuWorkbook.Close SaveChanges:=False
    'Delete the DayModel sheet
    modelWorkbook.Sheets("DayModel").Delete
    modelWorkbook.Save
End Sub

Sub Execute()
    CopyData "PLUS", "Database"
    CopyData "PLUS", "Application"
    CopyData "PRO", "Database"
    CopyData "PRO", "Application"
End Sub