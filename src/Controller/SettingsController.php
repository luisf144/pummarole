<?php

namespace App\Controller;

use App\Utils\PomSettings;
use App\Entity\Settings;
use App\Form\SettingsFormType;
use App\Repository\SettingsRepository;
use Doctrine\ORM\EntityManagerInterface;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\IsGranted;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

class SettingsController extends AbstractController
{
    private $settingsRepo;
    private $em;

    public function __construct(EntityManagerInterface $entityManager, SettingsRepository $settingsRepo)
    {
        $this->em = $entityManager;
        $this->settingsRepo = $settingsRepo;
    }

    private function findSettingAndSetValue($slug, $value): void
    {
        $setting = $this->settingsRepo->findBy(['slug' => $slug]);
        $setting = array_pop($setting);

        /** @var Settings $setting */
        if($setting)
            $setting->setValue($value);

        $this->em->persist($setting);
    }

    /**
     * @Route("/settings/edit", name="settings_edit")
     * @param Request $request
     * @return Response
     */
    public function edit(Request $request): Response
    {
        $pomSettings = new PomSettings();
        $form = $this->createForm(SettingsFormType::class, $pomSettings);
        $form->handleRequest($request);

        if ($form->isSubmitted() && $form->isValid()) {
            /** @var PomSettings $formData */
            $formData = $form->getData();

            // Get request value from Form and Update Entity
            if($formData->getPomCycle() && $formData->getPomCycle() !== '')
                $this->findSettingAndSetValue($pomSettings->getSlugsByDefault()[0], $formData->getPomCycle());

            if($formData->getPom() && $formData->getPom() !== '')
                $this->findSettingAndSetValue($pomSettings->getSlugsByDefault()[1], $formData->getPom());

            if($formData->getSb() && $formData->getSb() !== '')
                $this->findSettingAndSetValue($pomSettings->getSlugsByDefault()[2], $formData->getSb());

            if($formData->getLb() && $formData->getLb() !== '')
                $this->findSettingAndSetValue($pomSettings->getSlugsByDefault()[3], $formData->getLb());

            $this->em->flush();

            return $this->redirectToRoute("main");
        }
        else if(!$form->isSubmitted()){
            //Retrieve Data from DB and show into PomSettings
            $settings = $this->settingsRepo->findAllBySlugs($pomSettings->getSlugsByDefault());

            //Mapping and Populating data into PomSettings
            $pomSettings = new PomSettings();
            $pomSettings->populate($settings);
            $form = $this->createForm(SettingsFormType::class, $pomSettings);
        }

        return $this->render('settings/index.html.twig', [
            'settingsForm' => $form->createView()
        ]);
    }
}
