# GameVault — Gaming E-Commerce Product Catalog

A full-stack demo storefront: a Spring Boot REST API backing a vanilla HTML/CSS/JS dark-themed gaming marketplace, deployed on AWS with a full Jenkins CI/CD pipeline.

---

## 📐 Project Structure

```
gamevault/
├── backend/     # Spring Boot REST API (Maven project)
├── frontend/    # Vanilla HTML/CSS/JS storefront
├── Dockerfile
├── Jenkinsfile
└── README.md
```

---

## 🏗️ Architecture

The app is deployed as a monolithic 2-tier system on AWS:

- **App server (EC2, t3.large)** — runs the Spring Boot backend on Apache Tomcat, plus the CI/CD tooling (Jenkins, SonarQube).
- **Database (RDS, PostgreSQL)** — hosts the `gamevault` production database, alongside separate `sonarqube` and `postgres` system databases on the same instance.
- **Route 53** — custom domain routing.
- **CloudWatch** — monitoring and observability across both EC2 instances.

![AWS EC2 Instances](docs/EC2-instance.png)
*Two running EC2 instances (`t3.large`) across `ap-southeast-1a` / `1b` — one for the app, one for CI/CD & code quality tooling.*

---

## 🔁 CI/CD Pipeline

Built with a Jenkinsfile-based pipeline triggered on GitHub commits:

**GitHub → SCM Checkout → Maven Build → SonarQube Analysis → Build Docker Image → Trivy Security Scan → Docker Image Push → Remove Previous Container → Docker Deployment → Deploy Frontend**

![Jenkins Dashboard](docs/screenshots/jenkins-dashboard.png)
*Jenkins dashboard showing the `Test-gamevault` and `Test-Stage-Stockpulse` pipeline jobs.*

![Pipeline Stage View](docs/screenshots/pipeline-stage-view.png)
*Full stage view of the `Test-gamevault` pipeline — average full run time ~1min 9s, with per-stage timing across builds. Produces a `trivy-report.json` security artifact on every successful run.*

### Credentials management
All sensitive values (SonarQube token, Docker Hub login, DB host/name/user/password) are stored as scoped Jenkins credentials rather than hardcoded in the pipeline.

![Jenkins Credentials](docs/screenshots/jenkins-credentials.png)

### Frontend deployment step
The frontend is served via a lightweight Python HTTP server, restarted cleanly as part of each deployment (kill any existing process on port 8081, then relaunch in the background):

```bash
pkill -9 -f "http.server 8081" || true
nohup python3 -m http.server 8081 --bind 0.0.0.0 > /tmp/frontend.log 2>&1 &
```

![Frontend Deploy Step](docs/screenshots/frontend-deploy-terminal.png)

---

## 🔍 Code Quality & Security

Static analysis and vulnerability scanning run as part of every pipeline execution via **SonarQube** and **Trivy**.

![SonarQube Projects](docs/screenshots/sonarqube-projects.png)
*SonarQube dashboard tracking `GameVault`, `StockPulse`, and `Website` projects — security, reliability, and maintainability ratings per build.*

---

## 🗄️ Database

PostgreSQL is hosted on AWS RDS, with separate databases for the application and the CI/CD tooling:

- `gamevault` — production schema (`products` table)
- `sonarqube` — SonarQube's own backing schema
- `postgres` / `rdsadmin` — system databases

![RDS Database Connection](docs/screenshots/rds-psql-connection.png)
![SonarQube Schema Tables](docs/screenshots/sonarqube-schema-tables.png)

---

## 📊 Monitoring

A custom **CloudWatch dashboard** (`server-monitor`) tracks both EC2 instances in real time:

- **Production server** — CPU credit balance/usage, CPU utilization, network packets out, network in
- **Database / SonarQube container host** — network packets in, CPU credit usage, CPU credit balance, CPU utilization

![CloudWatch Dashboards List](docs/screenshots/cloudwatch-dashboards.png)
![CloudWatch Server Monitor](docs/screenshots/cloudwatch-server-monitor.png)

---

## 🖥️ Server / Container Setup

The app server runs Ubuntu 26.04 LTS with Docker managing the deployed containers:

```bash
docker images
# raiden004/gamevault:latest
# tomcat:10.1

docker ps -a
# gamevault container running, mapped 8085 -> 8080
```

Jenkins workspace on the server holds separate build directories per pipeline/environment (`Test-gamevault`, `Prod-Live`, `Production-live-gamevault`, `Stockpulse`, etc.), keeping test and production deployments isolated.

![EC2 Terminal - Docker & Workspace](docs/screenshots/ec2-docker-workspace.png)

---

## 🚀 Tech Stack

| Layer            | Technology                          |
|-------------------|--------------------------------------|
| Backend           | Spring Boot (Java), Maven            |
| Frontend          | HTML, CSS, JavaScript                |
| Database          | PostgreSQL (AWS RDS)                 |
| CI/CD             | Jenkins, Jenkinsfile (Declarative)   |
| Containerization  | Docker, Docker Hub                   |
| Code Quality      | SonarQube                            |
| Security Scanning | Trivy                                |
| Infrastructure    | AWS EC2, RDS, Route 53, CloudWatch   |
| OS                | Ubuntu 26.04 LTS                     |

---

## 📝 Notes

This project was built as a hands-on AWS + DevOps learning exercise, covering end-to-end pipeline automation, infrastructure provisioning, container security scanning, and observability — not just application development.
