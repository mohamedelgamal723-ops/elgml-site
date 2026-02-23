param(
  [string]$repo = ''
)
if(-not $repo){
  Write-Host "Usage: .\deploy.ps1 -repo 'https://github.com/your-username/repo.git'"
  exit 1
}
Write-Host "Initializing git and pushing to $repo"
git init
git add .
git commit -m "Deploy Elgml site"
git branch -M main
git remote add origin $repo
git push -u origin main
