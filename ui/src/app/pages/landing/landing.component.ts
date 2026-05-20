import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="landing">
      <div class="hero">
        <div class="container">
          <div class="hero-content">
            <h1 class="hero-title">Unlimited Movies, Shows & More</h1>
            <p class="hero-subtitle">
              Discover thousands of movies and shows. Watch anywhere. Cancel anytime.
            </p>
            <div class="hero-buttons">
              <button routerLink="/signup" class="btn btn-primary">Get Started</button>
              <button routerLink="/login" class="btn btn-secondary">Sign In</button>
            </div>
          </div>
          <div class="hero-visual">
            <div class="gradient-orb orb-1"></div>
            <div class="gradient-orb orb-2"></div>
            <div class="gradient-orb orb-3"></div>
          </div>
        </div>
      </div>

      <div class="features">
        <div class="container">
          <h2>Why Choose CineZone?</h2>
          <div class="features-grid">
            <div class="feature-card">
              <div class="feature-icon">📺</div>
              <h3>Vast Library</h3>
              <p>Access thousands of movies and shows in every genre</p>
            </div>
            <div class="feature-card">
              <div class="feature-icon">📱</div>
              <h3>Watch Anywhere</h3>
              <p>Stream on any device - phone, tablet, or TV</p>
            </div>
            <div class="feature-card">
              <div class="feature-icon">✨</div>
              <h3>Personalized</h3>
              <p>Curated recommendations based on your taste</p>
            </div>
            <div class="feature-card">
              <div class="feature-icon">⚡</div>
              <h3>Ad-Free</h3>
              <p>Uninterrupted streaming experience</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .landing {
      background: linear-gradient(135deg, #0a0a0f 0%, #1a1a25 100%);
    }

    .hero {
      min-height: 90vh;
      display: flex;
      align-items: center;
      overflow: hidden;
      position: relative;

      .container {
        display: grid;
        grid-template-columns: 1fr 1fr;
        align-items: center;
        gap: 4rem;
        position: relative;
        z-index: 1;
      }
    }

    .hero-content {
      z-index: 2;

      .hero-title {
        color: #e5e5e7;
        margin-bottom: 1.5rem;
      }

      .hero-subtitle {
        font-size: 1.25rem;
        color: #a1a1a6;
        margin-bottom: 2.5rem;
        line-height: 1.8;
      }

      .hero-buttons {
        display: flex;
        gap: 1.5rem;
        flex-wrap: wrap;
      }
    }

    .hero-visual {
      position: relative;
      height: 400px;

      .gradient-orb {
        position: absolute;
        border-radius: 50%;
        filter: blur(40px);
        opacity: 0.6;
      }

      .orb-1 {
        width: 300px;
        height: 300px;
        background: linear-gradient(135deg, #7c3aed, #6d28d9);
        top: 0;
        right: 0;
      }

      .orb-2 {
        width: 250px;
        height: 250px;
        background: linear-gradient(135deg, #06b6d4, #0891b2);
        bottom: 50px;
        left: 50px;
        animation: float 6s ease-in-out infinite;
      }

      .orb-3 {
        width: 200px;
        height: 200px;
        background: linear-gradient(135deg, #ec4899, #be185d);
        top: 100px;
        right: 100px;
        animation: float 8s ease-in-out infinite reverse;
      }

      @keyframes float {
        0%, 100% {
          transform: translateY(0px);
        }
        50% {
          transform: translateY(-20px);
        }
      }
    }

    .features {
      padding: 6rem 0;
      background-color: rgba(20, 20, 32, 0.5);

      .container {
        h2 {
          text-align: center;
          margin-bottom: 4rem;
          color: #e5e5e7;
        }
      }

      .features-grid {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 2rem;
      }

      .feature-card {
        background: linear-gradient(135deg, rgba(124, 58, 237, 0.1), rgba(109, 40, 217, 0.05));
        border: 1px solid rgba(124, 58, 237, 0.2);
        padding: 2rem;
        border-radius: 1rem;
        text-align: center;
        transition: all 0.3s ease;

        &:hover {
          border-color: #7c3aed;
          box-shadow: 0 8px 32px rgba(124, 58, 237, 0.15);
          transform: translateY(-4px);
        }

        .feature-icon {
          font-size: 3rem;
          margin-bottom: 1rem;
        }

        h3 {
          margin-bottom: 0.75rem;
          color: #e5e5e7;
        }

        p {
          color: #a1a1a6;
        }
      }
    }

    @media (max-width: 1024px) {
      .hero .container {
        grid-template-columns: 1fr;
        gap: 2rem;
      }

      .hero-visual {
        display: none;
      }

      .features .features-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }

    @media (max-width: 640px) {
      .hero {
        min-height: 60vh;
      }

      .hero-content {
        .hero-title {
          font-size: 2rem;
        }

        .hero-subtitle {
          font-size: 1rem;
        }

        .hero-buttons {
          flex-direction: column;
        }
      }

      .features .features-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class LandingComponent {}
