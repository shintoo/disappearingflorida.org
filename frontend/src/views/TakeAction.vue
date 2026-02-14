<template>
  <div class="species-page">
    <h1>Take Action</h1>
    <p class="subtitle">
      Below are various organizations that are working to protect our natural environment through different tactics,
      such as land conservation, rehabilitation, and smarter development.
    </p>

    <div class="organization-card">
      <div class="org-image-description">
        <div class="org-image">
          <img src="/images/orgs/1000fof.jpg" />
        </div>
        <div>
          <div class="org-header">
            <h3 class="org-name">1000 Friends of Florida</h3>
            <div class="org-tags">
              <span class="tag tag-conservation">Land Conservation</span>
              <span class="tag tag-development">Smart Development</span>
            </div>
          </div>
          <div class="org-description">
            <p>
              1000 Friends of Florida focuses on both sides of the problem: ensuring that development and growth in the state of Florida is done in a sustainable way,
              with smarter, more livable communities, as well as fighting for the conservation and restoration of wild land. 1000 Friends of Florida promotes sustainable
              community design, contributes to restoration studies, and litigates against unjust practices in our state legislature.
            </p>
          </div>
        </div>
      </div>
      <a href="https://1000fof.org/about" target="_blank" rel="noopener noreferrer" class="btn solid">Visit 1000fof.org</a>
    </div>

    <div class="organization-card">
      <div class="org-image-description">
        <div class="org-image">
          <img src="/images/orgs/nflt.jpg" />
          <span class="attr">Trish Hartmann</span>
        </div>
        <div>
          <div class="org-header">
            <h3 class="org-name">North Florida Land Trust</h3>
            <div class="org-tags">
              <span class="tag tag-conservation">Land Conservation</span>
            </div>
          </div>
          <div class="org-description">
            <p>Preserving land through ownership, NFLT has conserved over 44,000 acres of land in north Florida since
              it started. NFLT gained an additional 5,993 acres in 2024, and manages 24 preserves throughout north
              Florida. NFLT prioritizes the preservation of wildlife corridors, providing wildlife with continuous,
              undisturbed habitat so that they can roam freely. In 2024, NFLT acquired 1,109 acres in Bradford County,
              as part of the Ocala to Osceola (O2O) Wildlife Corridor, that strives to connect Osceola National Forest
              at the northern edge of Florida to Ocala National Forest that lies east of Ocala. See a map of their
              protected land holdings on their <a
                href="https://www.arcgis.com/apps/dashboards/29c3360d28524790bea3b1d1aa2dc47e" target="_blank"
                rel="noopener noreferrer">dashboard</a>.</p>
          </div>
        </div>
      </div>
      <a href="https://nflt.org" target="_blank" rel="noopener noreferrer" class="btn solid">Visit nflt.org</a>
    </div>

    <div class="organization-card">
      <div class="org-image-description">
        <div class="org-image">
          <img src="/images/orgs/flwh.jpg" />
        </div>
        <div>
          <div class="org-header">
            <h3 class="org-name">Florida Wildlife Hospital</h3>
            <div class="org-tags">
              <span class="tag tag-rehabilitation">Wildlife Rehabilitation</span>
            </div>
          </div>
          <div class="org-description">
            <p>FWH focuses on rehabilitating sick, injured, and orphaned wildlife in Brevard County. The hospital saw
              7,498 patients in 2024, including 264 gopher tortoises and 32 sandhill cranes. With a full-time
              veterinarian
              and multiple veterinarian assistants on staff, FWH diagnoses and treats injured wildlife, nursing them
              back
              to health so that they can be released back into the wild.</p>
          </div>
        </div>
      </div>
      <a href="https://floridawildlifehospital.org" target="_blank" rel="noopener noreferrer" class="btn solid">Visit
        floridawildlifehospital.org</a>
    </div>

    <div class="organization-card">
      <div class="org-image-description">
        <div class="org-image">
          <img src="/images/orgs/oyimby.jpg" />
        </div>
        <div>
          <div class="org-header">
            <h3 class="org-name">Orlando YIMBY</h3>
            <div class="org-tags">
              <span class="tag tag-development">Smart Development</span>
            </div>
          </div>
          <div class="org-description">
            <p>Orlando YIMBY pushes at the local level for housing development that <em>stops the sprawl</em>,
              focusing on creating higher density neighborhoods in the core of Orlando, rather than building more low
              density, sprawling development outwards that decimate Florida's landscapes. Emphasizing a need for
              sustainable development, Orlando YIMBY also works with local government to prioritize people over cars,
              so that land can be used for housing and public transit systems that enable residents to live
              sustainably.</p>
          </div>
        </div>
      </div>
      <a href="https://orlandoyimby.org" target="_blank" rel="noopener noreferrer" class="btn solid">Visit
        orlandoyimby.org</a>
    </div>
  </div>
</template>

<script>
</script>

<style scoped>
.subtitle {
  color: var(--color-text-light);
  font-size: 1rem;
  margin-bottom: 2rem;

  line-height: 1.6;
}

.org-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}

.tag {
  display: inline-block;
  padding: 0.2rem 0.6rem;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.02em;
}

.tag-conservation {
  background-color: #d4edda;
  color: #1a5928;
}

.tag-rehabilitation {
  background-color: #d6eaf8;
  color: #1a4d7a;
}

.tag-development {
  background-color: #fef3cd;
  color: #7a5e0b;
}

.organization-card {
  background: white;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  display: flex;
  flex-direction: column;
}

.org-header {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
}

.org-name {
  font-size: 1.5rem;
  color: var(--color-primary-dark);
  margin: 0;
  font-weight: 600;
}



.org-description {
  color: var(--color-text);
  line-height: 1.7;
}

.org-description p {
  margin: 0;
}

.org-description a {
  color: var(--color-primary);
  word-break: break-all;
  transition: color 0.2s;
}

.org-description a:hover {
  color: var(--color-accent);
}

.organization-card .btn {
  margin: auto;
  margin-top: 2rem;
}

.org-image-description {
  display: flex;
  align-items: center;
  flex-direction: column;
}

.org-description em {
  font-style: italic;
  color: var(--color-primary-dark);
  font-weight: 500;
}

.org-image {
  margin: 1rem;
  border-radius: 100%;
  width: 150px;
  max-width: 150px;
  position: relative;
}

.org-image img {
  width: 150px;
  border-radius: 100%;
  border: 2px solid var(--color-highlight);
}

.org-image .attr {
  opacity: 0;
  transition: opacity 0.1s ease;
  position: absolute;
  bottom: 8px;
  left: 50%;
  transform: translateX(-50%);
  color: white;
  text-shadow: 0 0 5px black;
  text-align: center;
  font-size: 0.7rem;
}

.org-image:hover .attr {
  opacity: 1.0;
}

/* Tablet and up */
@media (min-width: 768px) {
  .subtitle {
    font-size: 1.125rem;
    margin-bottom: 3rem;
  }

  .org-header {
    justify-content: space-between;
    align-items: baseline;
  }

  .organization-card {
    padding: 2rem;
  }

  .org-image-description {
    flex-direction: row;
  }
}

/* Desktop and up */
@media (min-width: 1024px) {
  .subtitle {
    font-size: 1.25rem;
  }

  .org-image {
    margin: 3rem;
    max-width: 150px;
  }


  .org-image .attr {
    bottom: 15px;
    font-size: 1rem;
  }
}
</style>
