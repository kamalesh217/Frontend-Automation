# scripts/cleanup.ps1
$url = "https://6a4b3689f5eab0bb6b625725.mockapi.io/employee"
Write-Host "Fetching employees..."
$rawResponse = Invoke-RestMethod -Uri $url -Method Get
$rawResponse = $rawResponse -replace '"bankaccount":', '"bankaccount_lower":'
$employees = $rawResponse | ConvertFrom-Json

$keptEmails = @{}
$coreEmails = @(
    "john.smith@company.com",
    "sarah.j@company.com",
    "sarah.johnson@company.com",
    "mike.davis@company.com",
    "emily.b@company.com",
    "emily.brown@company.com"
)

Write-Host "Total employees found: $($employees.Count)"

foreach ($emp in $employees) {
    $email = $emp.email
    $id = $emp.id
    
    # Check if this email is a core email and we haven't kept one yet
    $isCore = $false
    foreach ($core in $coreEmails) {
        if ($email -eq $core) {
            $isCore = $true
            break
        }
    }
    
    if ($isCore -and -not $keptEmails.ContainsKey($email)) {
        Write-Host "Keeping: $($emp.name) ($email) with ID $id"
        $keptEmails[$email] = $id
    } else {
        Write-Host "Deleting duplicate/non-core: $($emp.name) ($email) with ID $id"
        try {
            $deleteUrl = "$url/$id"
            Invoke-RestMethod -Uri $deleteUrl -Method Delete | Out-Null
            Write-Host "  Successfully deleted ID $id"
        } catch {
            Write-Error "  Failed to delete ID $($id): $($_.Exception.Message)"
        }
        Start-Sleep -Milliseconds 200 # Avoid rate limiting
    }
}

Write-Host "Cleanup complete."
